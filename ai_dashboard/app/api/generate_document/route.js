import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { getSchema } from "./schemas/reportSchemas";
import { createClient } from "@/utils/supabase/server";
import { isTokenLimitExceeded, isApproachingTokenLimit, fetchTotalTokenUsage } from "@/utils/tokenLimits";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Add this helper function at the top
function getHumanFriendlyError(error) {
  // Common error patterns and their user-friendly messages
  const errorPatterns = {
    'Title should be between 6-12 words': 'The generated title is too long. Please try again with more specific requirements for a concise title.',
    'Invalid document type': 'The selected document type is not supported. Please try again.',
    'context length': 'Your input is too long. Please provide a shorter description or reduce the number of files.',
    'rate limit': 'We\'re processing too many requests. Please wait a moment and try again.',
    'invalid_api_key': 'There was an authentication error. Please contact support.',
    'Failed to generate': 'Unable to generate the document. Try adjusting your description to be more specific.',
    'Failed to parse': 'The generated content did not meet our requirements. Please try again with more specific instructions or selected files.',
    'OutputParserException': 'The generated content format was invalid. Please try again with clearer requirements.',
  };

  // First check if it's a schema validation error
  if (error.message.includes('Failed to parse')) {
    try {
      // Extract the specific validation error message
      const match = error.message.match(/Error: \[(.*?)\]/);
      if (match) {
        const validationError = JSON.parse(match[1]);
        if (validationError.message) {
          return `Please adjust your requirements: ${validationError.message}`;
        }
      }
    } catch (e) {
      // If parsing fails, fall back to pattern matching
    }
  }

  // Check if error message matches any known patterns
  for (const [pattern, message] of Object.entries(errorPatterns)) {
    if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }

  // Default error message
  return 'There was an error generating your document. Please try providing more specific requirements or contact support if the issue persists.';
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { documentType, subType, content, fileContents, selectedFiles, workspaceId } = await req.json();

    // Check token limits first
    const tokenUsage = await fetchTotalTokenUsage(supabase, user.id);
    if (isTokenLimitExceeded(tokenUsage)) {
      return new Response(
        JSON.stringify({
          warning: "Token limit exceeded",
          details: "You have reached your token usage limit. Please contact support to increase your limit.",
          warningType: 'TokenLimitWarning'
        }),
        { status: 200 }
      );
    }

    if (isApproachingTokenLimit(tokenUsage)) {
      return new Response(
        JSON.stringify({
          warning: "Approaching token limit",
          details: "You don't have enough tokens remaining to generate this document. Please contact support to increase your limit.",
          warningType: 'ApproachingLimitWarning'
        }),
        { status: 200 }
      );
    }

    // Track token usage during generation
    let totalTokens = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0
    };

    // Initialize text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 12000,
      chunkOverlap: 2000,
      separators: ["\n\n", "\n", ".", " ", "?", "!", ";", ","],
    });

    // Split all contents into chunks
    const chunks = [];
    for (const content of fileContents) {
      const contentChunks = await textSplitter.splitText(content);
      chunks.push(...contentChunks);
    }

    // Initialize ChatOpenAI with structured output and callbacks
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.3,
      callbacks: [{
        handleLLMEnd(output) {
          if (output.llmOutput?.tokenUsage) {
            totalTokens.promptTokens += output.llmOutput.tokenUsage.promptTokens || 0;
            totalTokens.completionTokens += output.llmOutput.tokenUsage.completionTokens || 0;
            totalTokens.totalTokens += output.llmOutput.tokenUsage.totalTokens || 0;
          }
        },
      }]
    });

    // Define schemas based on document type and subtype
    const schema = getSchema(documentType, subType);
    if (!schema) {
      throw new Error("Invalid document type or subtype");
    }

    // Create structured output parser from schema
    const parser = StructuredOutputParser.fromZodSchema(schema);

    // Create prompt template with format instructions
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are an expert analyst tasked with generating a detailed ${subType} based on the provided content and requirements.
      
        Important guidelines:
        - Provide specific examples and data points from the source material
        - Include quantitative analysis where relevant
        - Highlight key insights and implications
        - Maintain professional language and industry-specific terminology
        - Ensure comprehensive coverage of all major points
        - Add relevant citations to source material
        
        {format_instructions}
        
        Note: The title should be 6-12 words and clearly reflect the main focus of the analysis.`],
      ["human", `Content requirements: {content}

        Source material to analyze:
        {chunk}
        
        Please ensure the analysis is thorough and includes:
        1. Detailed examination of key points
        2. Supporting evidence from the source material
        3. Industry context and implications
        4. Specific recommendations where applicable`]
    ]);

    // Process chunks and generate report
    const processedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const formattedPrompt = await prompt.formatMessages({
          content,
          chunk,
          format_instructions: parser.getFormatInstructions()
        });

        const result = await model.invoke(formattedPrompt);
        const parsed = await parser.parse(result.content);
        
        processedChunks.push({
          ...parsed,
          sourceText: chunk
        });
      } catch (chunkError) {
        console.error(`Error processing chunk ${i + 1}:`, chunkError);
        throw new Error(`Failed to process content: ${getHumanFriendlyError(chunkError)}`);
      }
    }

    // Combine the results
    const { report, metadata } = combineReports(processedChunks, documentType, subType);

    // After generating the report, first insert it into the database
    const { data: reportData, error: insertError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        document_type: documentType,
        sub_type: subType,
        content: content,
        report_data: report,
        metadata: metadata,
        source_files: selectedFiles,
        token_usage: totalTokens.totalTokens > 0 ? totalTokens : null
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Now we have the report ID, we can log the token usage
    const { error: logError } = await supabase
      .from('token_usage_logs')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        tokens_used: totalTokens.totalTokens,
        usage_type: 'document_generation',
        document_id: reportData.id  // Use the ID from the inserted report
      });

    if (logError) throw logError;


    return new Response(JSON.stringify(report), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating report:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate report", 
        details: getHumanFriendlyError(error),
        technicalDetails: error.message,
        errorType: error.name || 'UnknownError'
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

function combineReports(chunks) {
  const metadata = {
    sources: {}
  };
  
  const combined = chunks.reduce((acc, chunk, index) => {
    const sourceInfo = {
      chunkIndex: `Source [${index + 1}]`,
      preview: chunk.sourceText
    };

    Object.entries(chunk).forEach(([key, value]) => {
      if (key === 'sourceText') return;

      if (key === 'title') {
        // For title, only use the first occurrence
        if (!acc[key]) {
          acc[key] = value;
          metadata.sources[key] = [sourceInfo];
        }
        return;
      }

      if (Array.isArray(value)) {
        // For array fields, store source in metadata
        const itemsWithoutSource = value.map(item => {
          const { source, ...itemWithoutSource } = item;
          return itemWithoutSource;
        });
        acc[key] = [...(acc[key] || []), ...itemsWithoutSource];
        
        // Store source information in metadata
        metadata.sources[key] = metadata.sources[key] || [];
        metadata.sources[key].push({
          ...sourceInfo,
          itemIndexes: value.map((_, idx) => acc[key].length - value.length + idx)
        });
      } else if (typeof value === 'object' && value !== null) {
        // For nested objects, separate metadata
        const { processedObject, objectMetadata } = processNestedObject(value, sourceInfo);
        acc[key] = {
          ...(acc[key] || {}),
          ...processedObject
        };
        
        metadata.sources[key] = metadata.sources[key] || [];
        metadata.sources[key].push({
          ...sourceInfo,
          ...objectMetadata
        });
      } else {
        // For simple fields
        acc[key] = acc[key] ? `${acc[key]}\n${value}` : value;
        metadata.sources[key] = metadata.sources[key] || [];
        metadata.sources[key].push(sourceInfo);
      }
    });
    return acc;
  }, {});

  return { report: combined, metadata };
}

// Add this helper function
function processNestedObject(obj, sourceInfo) {
  const processed = {};
  const metadata = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      processed[key] = value.map(item => {
        if (typeof item === 'object') {
          const { source, ...itemWithoutSource } = item;
          return itemWithoutSource;
        }
        return item;
      });
      metadata[key] = { type: 'array', items: value.length };
    } else if (typeof value === 'object' && value !== null) {
      const { processedObject, objectMetadata } = processNestedObject(value, sourceInfo);
      processed[key] = processedObject;
      metadata[key] = objectMetadata;
    } else {
      processed[key] = value;
      metadata[key] = { type: 'simple' };
    }
  });

  return { processedObject: processed, objectMetadata: metadata };
}