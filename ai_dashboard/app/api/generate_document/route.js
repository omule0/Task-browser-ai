import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { getSchema } from "./schemas/reportSchemas";
import { createClient } from "@/utils/supabase/server";
import { isTokenLimitExceeded, isApproachingTokenLimit, fetchTotalTokenUsage } from "@/utils/tokenLimits";

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
    'Failed to parse': 'The generated content did not meet our requirements. Please try again with more specific instructions.',
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
      chunkSize: 90000,
      chunkOverlap: 4000,
    });

    // Split all contents into chunks
    const chunks = [];
    for (const content of fileContents) {
      const contentChunks = await textSplitter.splitText(content);
      chunks.push(...contentChunks);
    }

    // Define schemas based on document type and subtype
    const schema = getSchema(documentType, subType);
    if (!schema) {
      throw new Error("Invalid document type or subtype");
    }

    // Initialize ChatOpenAI with structured output and callbacks
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      callbacks: [{
        handleLLMEnd(output) {
          // Update totalTokens directly from the callback
          if (output.llmOutput?.tokenUsage) {
            totalTokens.promptTokens += output.llmOutput.tokenUsage.promptTokens || 0;
            totalTokens.completionTokens += output.llmOutput.tokenUsage.completionTokens || 0;
            totalTokens.totalTokens += output.llmOutput.tokenUsage.totalTokens || 0;
          }
        },
      }]
    }).withStructuredOutput(schema);

    // Process chunks and generate report
    const processedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const result = await model.invoke(
          `Generate a ${subType} based on the following content and requirements: ${content}
           
           Source document content:
           ${chunk}
           
           Important: Ensure the title is between 6-12 words and the ${documentType} follows the required structure.
           Incorporate relevant information from the source document.`
        );

        // No need to track tokens here anymore since we're doing it in the callback
        processedChunks.push({
          ...result,
          sourceText: chunk
        });
      } catch (chunkError) {
        console.error(`Error processing chunk ${i + 1}:`, chunkError);
        throw new Error(`Failed to process content: ${getHumanFriendlyError(chunkError)}`);
      }
    }

    // Combine the results
    const combinedReport = combineReports(processedChunks, documentType, subType);

    // After generating the report, first insert it into the database
    const { data: report, error: insertError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        document_type: documentType,
        sub_type: subType,
        content: content,
        report_data: combinedReport,
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
        document_id: report.id  // Use the ID from the inserted report
      });

    if (logError) throw logError;

    // Log the token usage for debugging
    console.log("Token usage logged:", {
      reportId: report.id,
      totalTokens,
      userId: user.id,
      workspaceId
    });

    return new Response(JSON.stringify(combinedReport), {
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
  const sourceMap = new Map();
  
  const combined = chunks.reduce((acc, chunk, index) => {
    const sourceInfo = {
      chunkIndex: `Source [${index + 1}]`,
      preview: truncateText(chunk.sourceText, 150)
    };

    Object.entries(chunk).forEach(([key, value]) => {
      if (key === 'sourceText') return;

      if (key === 'title') {
        // For title, only use the first occurrence
        if (!acc[key]) {
          acc[key] = value;
          sourceMap.set(key, [sourceInfo]);
        }
        return;
      }

      if (Array.isArray(value)) {
        // For array fields, add source with text preview
        const itemsWithSource = value.map(item => ({
          ...item,
          source: sourceInfo
        }));
        acc[key] = [...(acc[key] || []), ...itemsWithSource];
      } else if (typeof value === 'object' && value !== null) {
        // For nested objects, recursively add source
        const processNestedObject = (obj) => {
          const processed = {};
          Object.entries(obj).forEach(([nestedKey, nestedValue]) => {
            if (Array.isArray(nestedValue)) {
              processed[nestedKey] = nestedValue.map(item => 
                typeof item === 'object' ? { ...item, source: sourceInfo } : item
              );
            } else if (typeof nestedValue === 'object' && nestedValue !== null) {
              processed[nestedKey] = processNestedObject(nestedValue);
            } else {
              processed[nestedKey] = nestedValue;
            }
          });
          return { ...processed, source: sourceInfo };
        };
        
        acc[key] = {
          ...(acc[key] || {}),
          ...processNestedObject(value)
        };
      } else {
        // For simple fields, track source in sourceMap
        acc[key] = acc[key] ? `${acc[key]}\n${value}` : value;
        sourceMap.set(key, [
          ...(sourceMap.get(key) || []),
          sourceInfo
        ]);
      }
    });
    return acc;
  }, {});

  // Add source information for simple fields
  Object.keys(combined).forEach(key => {
    if (typeof combined[key] === 'string') {
      combined[key] = {
        content: combined[key],
        sources: sourceMap.get(key)
      };
    }
  });

  return combined;
}

// Helper function to truncate text and add ellipsis
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}