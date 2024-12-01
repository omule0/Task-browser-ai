import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { createClient } from "@/utils/supabase/server";
import {
  isTokenLimitExceeded,
  isApproachingTokenLimit,
  fetchTotalTokenUsage,
} from "@/utils/tokenLimits";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

// Helper function for user-friendly error messages
function getHumanFriendlyError(error) {
  const errorPatterns = {
    "context length":
      "Your input is too long. Please reduce the number of files or their size.",
    "rate limit":
      "We're processing too many requests. Please wait a moment and try again.",
    invalid_api_key:
      "There was an authentication error. Please contact support.",
    "Failed to generate":
      "Unable to generate the report. Please try with different files or template.",
    "Failed to parse":
      "The generated content did not meet the template requirements. Please try again.",
    OutputParserException:
      "The generated content format was invalid. Please try again with a different template.",
  };

  // Check if error message matches any known patterns
  for (const [pattern, message] of Object.entries(errorPatterns)) {
    if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }

  // Default error message
  return "There was an error generating your report. Please try again or contact support if the issue persists.";
}

// Helper function to convert JSON schema to Zod schema
function jsonSchemaToZod(schema) {
  if (!schema || typeof schema !== "object") {
    throw new Error("Invalid schema format");
  }

  // Handle different types
  switch (schema.type) {
    case "object":
      const properties = {};
      const required = schema.required || [];

      Object.entries(schema.properties || {}).forEach(([key, value]) => {
        properties[key] = jsonSchemaToZod(value);
      });

      let zodObject = z.object(properties);
      if (!schema.additionalProperties) {
        zodObject = zodObject.strict();
      }
      return zodObject;

    case "array":
      return z.array(jsonSchemaToZod(schema.items));

    case "string":
      return z.string();

    case "number":
      return z.number();

    case "boolean":
      return z.boolean();

    case "null":
      return z.null();

    default:
      return z.any();
  }
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { schema: jsonSchema, reportData } = await req.json();

    // Check token limits first
    const tokenUsage = await fetchTotalTokenUsage(supabase, user.id);
    if (isTokenLimitExceeded(tokenUsage)) {
      return new Response(
        JSON.stringify({
          warning: "Token limit exceeded",
          details:
            "You have reached your token usage limit. Please contact support to increase your limit.",
          warningType: "TokenLimitWarning",
        }),
        { status: 200 }
      );
    }

    if (isApproachingTokenLimit(tokenUsage)) {
      return new Response(
        JSON.stringify({
          warning: "Approaching token limit",
          details:
            "You are approaching your token limit. Please contact support to increase your limit.",
          warningType: "ApproachingLimitWarning",
        }),
        { status: 200 }
      );
    }

    // Initialize token tracking
    let totalTokens = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    // Validate file contents
    if (!reportData.files || reportData.files.length === 0) {
      throw new Error("No file contents provided");
    }

    // Initialize text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 90000,
      chunkOverlap: 4000,
      separators: ["\n\n", "\n", ".", "!", "?", ";", ":", " ", ""],
    });

    // Process and organize file contents
    const processedChunks = [];
    for (const content of reportData.files) {
      const chunks = await textSplitter.splitText(content);
      processedChunks.push(...chunks);
    }

    // Combine chunks with metadata
    const contextString = processedChunks
      .map((chunk, index) => `[Document ${index + 1}]\n${chunk}\n`)
      .join("\n---\n");

    // Create a more detailed prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an expert report generator. Your task is to create a comprehensive report based on the provided documents.

Instructions:
1. Carefully analyze all provided document contents
2. Extract relevant information that matches the required report structure
3. Ensure all sections of the report are filled with accurate information from the source documents
4. Maintain consistency throughout the report
5. Use direct quotes or paraphrase when appropriate
6. If information for a section is not found in the documents, indicate "Information not available in source documents"

Format your response according to these specifications:
{format_instructions}

Remember: All information must be derived from the provided documents. Do not make assumptions or add external information.`,
      ],
      [
        "human",
        `Please generate a report based on the following source documents:

Source Documents:
{context}

Generate a complete report following the specified structure and using information from these documents.`,
      ],
    ]);

    // Initialize model with lower temperature for more factual output
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      callbacks: [
        {
          handleLLMEnd(output) {
            if (output.llmOutput?.tokenUsage) {
              totalTokens.promptTokens +=
                output.llmOutput.tokenUsage.promptTokens || 0;
              totalTokens.completionTokens +=
                output.llmOutput.tokenUsage.completionTokens || 0;
              totalTokens.totalTokens +=
                output.llmOutput.tokenUsage.totalTokens || 0;
            }
          },
        },
      ],
    });

    // Convert schema and create parser
    let zodSchema;
    try {
      zodSchema = jsonSchemaToZod(jsonSchema);
    } catch (schemaError) {
      console.error("Schema conversion error:", schemaError);
      throw new Error("Invalid schema format");
    }

    const parser = StructuredOutputParser.fromZodSchema(zodSchema);

    // Create chain with better context handling
    const chain = RunnableSequence.from([
      {
        context: async () => contextString,
        format_instructions: async () => parser.getFormatInstructions(),
      },
      prompt,
      model,
      parser,
    ]);

    // Generate report with error handling
    let report;
    try {
      report = await chain.invoke({});
    } catch (generationError) {
      console.error("Report generation error:", generationError);
      throw new Error("Failed to generate report: " + generationError.message);
    }

    // Validate report structure
    try {
      zodSchema.parse(report);
    } catch (validationError) {
      console.error("Report validation error:", validationError);
      throw new Error("Generated report does not match template structure");
    }

    // Save report to database with correct structure and actual file IDs
    const { data: savedReport, error: saveError } = await supabase
      .from("generated_reports")
      .insert({
        user_id: user.id,
        workspace_id: reportData.workspaceId,
        document_type: "Report",
        sub_type: "custom_report",
        content: reportData.schemaName,
        report_data: {
          template: {
            id: jsonSchema.id,
            name: jsonSchema.name || "Custom Template",
            schema: jsonSchema
          },
          sourceFiles: reportData.selectedFiles,
          generatedContent: report,
          metadata: {
            processedChunks: processedChunks.length,
            template_name: jsonSchema.name || "Custom Template",
            source_count: reportData.files.length,
            generation_date: new Date().toISOString(),
          }
        },
        token_usage: totalTokens.totalTokens > 0 ? totalTokens : null,
        source_files: reportData.selectedFiles,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving report:", saveError);
      throw new Error("Failed to save generated report");
    }

    // Log token usage
    const { error: logError } = await supabase.from("token_usage_logs").insert({
      user_id: user.id,
      workspace_id: reportData.workspaceId,
      tokens_used: totalTokens.totalTokens,
      usage_type: "report_generation",
      document_id: savedReport.id,
    });

    if (logError) throw logError;

    return new Response(
      JSON.stringify({
        success: true,
        report,
        reportId: savedReport.id,
        metadata: {
          processedChunks: processedChunks.length,
          totalTokens: totalTokens.totalTokens,
          savedAt: savedReport.created_at,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating report:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate report",
        details: getHumanFriendlyError(error),
        technicalDetails: error.message,
        errorType: error.name || "UnknownError",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
