import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { getSchema } from "./schemas/reportSchemas";
import { createClient } from "@/utils/supabase/server";

export async function POST(req) {
  try {
    const { documentType, subType, content, fileContents, selectedFiles, workspaceId } = await req.json();

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

    // Initialize ChatOpenAI with structured output
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
    }).withStructuredOutput(schema);

    // Process chunks and generate report
    const processedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const result = await model.invoke(
        `You are an expert in ${documentType} and ${subType} generation. Your task is to create a ${subType} based on the following content and requirements: ${content}
         
         Source document content to analyze:
         ${chunk}
         
         Ensure the ${documentType} follows the required structure and incorporates relevant information from the source document.
         
         Important: Your response must strictly follow the required schema structure. Ensure all fields are properly filled 
         and all arrays contain at least one item. For any field where information is not available, provide a reasonable 
         inference based on context rather than leaving it empty.`
      );

      // Add the source text to the result
      processedChunks.push({
        ...result,
        sourceText: chunk // Store the original chunk text
      });
    }

    // Combine the results
    const combinedReport = combineReports(processedChunks, documentType, subType);

    // After generating the report, store it in the database
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { error: insertError } = await supabase
      .from('generated_reports')
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        document_type: documentType,
        sub_type: subType,
        content: content,
        report_data: combinedReport,
        source_files: selectedFiles
      });

    if (insertError) throw insertError;

    return new Response(JSON.stringify(combinedReport), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate report", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
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