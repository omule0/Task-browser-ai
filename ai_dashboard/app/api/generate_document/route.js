import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { getSchema } from "./schemas/reportSchemas";
import { createClient } from "@/utils/supabase/server";
import { isTokenLimitExceeded, isApproachingTokenLimit, fetchTotalTokenUsage } from "@/utils/tokenLimits";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Enhanced chunk processing with better context management
function processChunksWithContext(chunks, maxContextSize = 12000) {
  const processedChunks = [];
  let currentContext = '';
  let currentSize = 0;

  chunks.forEach(chunk => {
    const chunkSize = chunk.length;
    if (currentSize + chunkSize <= maxContextSize) {
      currentContext += '\n' + chunk;
      currentSize += chunkSize;
    } else {
      if (currentContext) {
        processedChunks.push(currentContext);
      }
      currentContext = chunk;
      currentSize = chunkSize;
    }
  });

  if (currentContext) {
    processedChunks.push(currentContext);
  }

  return processedChunks;
}

// Enhanced prompt template generation based on document type
function generatePromptTemplate(documentType, subType) {
  const baseSystemPrompt = `You are an expert analyst specializing in ${documentType} with deep industry knowledge. 
    Your task is to generate a detailed ${subType} that adheres to professional standards and industry best practices.
    
    Critical requirements:
    1. Provide specific, data-driven analysis backed by source material
    2. Use industry-standard metrics and terminology
    3. Include quantitative analysis with proper context
    4. Maintain consistent narrative across sections
    5. Highlight key risks and opportunities
    6. Include specific examples and evidence
    7. Provide actionable insights and recommendations
    8. Ensure logical flow between sections
    9. Use precise, professional language
    10. Include proper citations to source material
    
    {format_instructions}`;

  const typeSpecificInstructions = {
    "Research report": `Focus on:
      - Research methodology rigor
      - Data validity and reliability
      - Clear connection between findings and evidence
      - Comprehensive literature review
      - Research implications`,
    "Buyside Due Diligence": `Focus on:
      - Investment thesis validation
      - Risk assessment and mitigation
      - Value creation opportunities
      - Market positioning analysis
      - Operational efficiency`,
    "Business Plan": `Focus on:
      - Market opportunity validation
      - Financial viability
      - Execution strategy
      - Competitive advantage
      - Growth potential`
  };

  return ChatPromptTemplate.fromMessages([
    ["system", `${baseSystemPrompt}\n\n${typeSpecificInstructions[documentType] || ''}`],
    ["human", `Context and requirements: {content}

      Source material to analyze:
      {chunk}
      
      Ensure your analysis:
      1. Maintains consistent narrative across sections
      2. Provides specific examples from source material
      3. Includes quantitative metrics where relevant
      4. Highlights key insights and implications
      5. Addresses potential risks and mitigation strategies`]
  ]);
}

// Enhanced error handling with specific error types
class ReportGenerationError extends Error {
  constructor(message, type, details) {
    super(message);
    this.name = 'ReportGenerationError';
    this.type = type;
    this.details = details;
  }
}

// Enhanced report combination with better deduplication and consistency
function enhancedCombineReports(chunks, documentType) {
  const metadata = {
    sources: {},
    analysis: {
      chunkCount: chunks.length,
      processingTime: new Date().toISOString(),
      documentType
    }
  };

  // Improved deduplication logic for arrays
  function deduplicateArray(arr, key = null) {
    const seen = new Set();
    return arr.filter(item => {
      const value = key ? item[key] : item;
      const stringified = JSON.stringify(value);
      if (seen.has(stringified)) return false;
      seen.add(stringified);
      return true;
    });
  }

  // Enhanced merger for nested objects
  function mergeNestedObjects(objects) {
    return objects.reduce((acc, obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          acc[key] = deduplicateArray(acc[key] ? [...acc[key], ...value] : value);
        } else if (typeof value === 'object' && value !== null) {
          acc[key] = acc[key] ? { ...acc[key], ...value } : value;
        } else {
          // For string values, concatenate with proper spacing and deduplication
          acc[key] = acc[key] ? `${acc[key]}\n${value}` : value;
        }
      });
      return acc;
    }, {});
  }

  const combined = chunks.reduce((acc, chunk, index) => {
    const sourceInfo = {
      chunkIndex: index + 1,
      preview: chunk.sourceText?.substring(0, 100) + '...'
    };

    // Process each field according to its type and schema requirements
    Object.entries(chunk).forEach(([key, value]) => {
      if (key === 'sourceText') return;

      if (Array.isArray(value)) {
        acc[key] = deduplicateArray(acc[key] ? [...acc[key], ...value] : value);
        metadata.sources[key] = [...(metadata.sources[key] || []), sourceInfo];
      } else if (typeof value === 'object' && value !== null) {
        acc[key] = mergeNestedObjects([acc[key] || {}, value]);
        metadata.sources[key] = [...(metadata.sources[key] || []), sourceInfo];
      } else {
        // Improved handling of string fields
        if (key === 'title' && !acc[key]) {
          acc[key] = value;
        } else {
          acc[key] = acc[key] ? `${acc[key]}\n${value}` : value;
        }
        metadata.sources[key] = [...(metadata.sources[key] || []), sourceInfo];
      }
    });

    return acc;
  }, {});

  return { report: combined, metadata };
}

export async function POST(req) {
  try {
    // Add token tracking variable
    let totalTokens = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0
    };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new ReportGenerationError("Unauthorized access", "AUTH_ERROR", "User authentication required");
    }

    const { documentType, subType, content, fileContents, selectedFiles, workspaceId } = await req.json();

    // Token usage validation
    const tokenUsage = await fetchTotalTokenUsage(supabase, user.id);
    if (isTokenLimitExceeded(tokenUsage)) {
      return new Response(
        JSON.stringify({
          warning: "Token limit exceeded",
          details: "Please contact support to increase your limit.",
          warningType: 'TokenLimitWarning'
        }),
        { status: 200 }
      );
    }

    // Initialize processing
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 12000,
      chunkOverlap: 2000,
      separators: ["\n\n", "\n", ".", " ", "?", "!", ";", ","],
    });

    // Process chunks with enhanced context
    const rawChunks = [];
    for (const content of fileContents) {
      const contentChunks = await textSplitter.splitText(content);
      rawChunks.push(...contentChunks);
    }
    
    const processedChunks = processChunksWithContext(rawChunks);

    // Initialize model with enhanced configuration and token tracking
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.2,
      maxTokens: 4000,
      topP: 0.8,
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

    // Get schema and create parser
    const schema = getSchema(documentType, subType);
    if (!schema) {
      throw new ReportGenerationError(
        "Invalid document configuration",
        "SCHEMA_ERROR",
        `Unknown document type: ${documentType} or subtype: ${subType}`
      );
    }

    const parser = StructuredOutputParser.fromZodSchema(schema);
    const prompt = generatePromptTemplate(documentType, subType);

    // Process chunks with enhanced error handling
    const processedResults = [];
    for (let i = 0; i < processedChunks.length; i++) {
      try {
        const formattedPrompt = await prompt.formatMessages({
          content,
          chunk: processedChunks[i],
          format_instructions: parser.getFormatInstructions()
        });

        const result = await model.invoke(formattedPrompt);
        const parsed = await parser.parse(result.content);
        
        processedResults.push({
          ...parsed,
          sourceText: processedChunks[i]
        });
      } catch (error) {
        throw new ReportGenerationError(
          `Chunk processing failed`,
          "PROCESSING_ERROR",
          { chunk: i, error: error.message }
        );
      }
    }

    // Combine results with enhanced logic
    const { report, metadata } = enhancedCombineReports(processedResults, documentType);

    // Save to database with enhanced error handling and token tracking
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

    if (insertError) {
      throw new ReportGenerationError(
        "Database operation failed",
        "DB_ERROR",
        insertError
      );
    }

    return new Response(JSON.stringify(report), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Report generation error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Report generation failed", 
        details: error instanceof ReportGenerationError ? error.details : error.message,
        type: error instanceof ReportGenerationError ? error.type : 'UNKNOWN_ERROR'
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}