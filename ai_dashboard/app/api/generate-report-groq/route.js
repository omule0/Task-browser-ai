import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

// Helper function to add source info to all items in a chunk result
function addSourceInfo(result, sourceInfo) {
  const formatSource = () => `Chunk ${sourceInfo.chunkNumber}: ${sourceInfo.preview}...`;
  
  // Deep clone the result to avoid modifying the original
  const processed = JSON.parse(JSON.stringify(result));
  
  // Add source to each type of item
  if (processed.keyFindings) {
    processed.keyFindings = processed.keyFindings.map(item => ({
      ...item,
      source: formatSource()
    }));
  }
  
  if (processed.mainInsights) {
    processed.mainInsights = processed.mainInsights.map(item => ({
      ...item,
      source: formatSource()
    }));
  }
  
  if (processed.recommendations) {
    processed.recommendations = processed.recommendations.map(item => ({
      ...item,
      source: formatSource()
    }));
  }
  
  if (processed.findings) {
    processed.findings = processed.findings.map(item => ({
      ...item,
      source: formatSource()
    }));
  }
  
  return processed;
}

// Helper function to combine executive summaries
function combineExecutiveSummaries(chunks) {
  return {
    keyFindings: deduplicateByContent(chunks.flatMap(c => c.keyFindings)),
    mainInsights: deduplicateByContent(chunks.flatMap(c => c.mainInsights)),
    recommendations: deduplicateByContent(chunks.flatMap(c => c.recommendations))
  };
}

// Helper function to combine detailed analyses
function combineDetailedAnalyses(chunks) {
  return {
    findings: deduplicateByContent(chunks.flatMap(c => c.findings)),
    recommendations: chunks.flatMap(c => c.recommendations),
    risks: deduplicateByContent(chunks.flatMap(c => c.risks))
  };
}

// Helper function to deduplicate arrays of objects with content
function deduplicateByContent(array) {
  const contentMap = new Map();
  
  array.forEach(item => {
    const content = item.content || item.description;
    if (!contentMap.has(content)) {
      contentMap.set(content, item);
    }
  });
  
  return Array.from(contentMap.values());
}

export async function POST(req) {
  try {
    const { documentType, subType, contents, prompt, selectedFiles } = await req.json();

    // Initialize text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 120000,
      chunkOverlap: 4000,
    });

    // Split all contents into chunks
    const chunks = [];
    for (const content of contents) {
      const contentChunks = await textSplitter.splitText(content);
      chunks.push(...contentChunks);
    }

    // Define schema based on document type
    const reportSchemas = {
      "Report": z.object({
        executiveSummary: z.string().describe("A brief overview of the report"),
        keyFindings: z.array(z.object({
          title: z.string(),
          description: z.string(),
          evidence: z.array(z.string()),
          source: z.string(),
        })).describe("List of key findings with supporting evidence"),
        recommendations: z.array(z.object({
          action: z.string(),
          impact: z.string(),
          timeline: z.string(),
        })).describe("List of actionable recommendations"),
      }),
      "Proposal": z.object({
        executiveSummary: z.string().describe("A brief overview of the proposal"),
        objectives: z.array(z.string()).describe("Key objectives of the proposal"),
        solution: z.object({
          description: z.string(),
          benefits: z.array(z.string()),
          implementation: z.array(z.object({
            phase: z.string(),
            activities: z.array(z.string()),
            timeline: z.string(),
          })),
        }).describe("Detailed solution and implementation plan"),
        budget: z.array(z.object({
          item: z.string(),
          cost: z.string(),
          justification: z.string(),
        })).describe("Budget breakdown"),
      }),
    };

    // Initialize ChatGroq with structured output
    const model = new ChatGroq({
      modelName: "mixtral-8x7b-32768",
      temperature: 0.7,
    }).withStructuredOutput(reportSchemas[documentType]);

    // Process chunks sequentially
    const processedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkNumber = i + 1;

      const result = await model.invoke(
        `You are a professional document writer. Create a ${documentType.toLowerCase()}${
          subType ? ` (specifically a ${subType})` : ''
        } based on the following content${
          prompt ? ` with this focus: ${prompt}` : ''
        }. This is chunk ${chunkNumber} of ${chunks.length}:\n\n${chunk}`
      );

      processedChunks.push(result);
    }

    // Combine the processed chunks into a final document
    const combinedDocument = {
      type: documentType,
      subType: subType,
      content: processedChunks[0], // For now, just use the first chunk's structure
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceFiles: selectedFiles,
        prompt: prompt || null,
      }
    };

    return new Response(JSON.stringify(combinedDocument), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating document:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate document",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}