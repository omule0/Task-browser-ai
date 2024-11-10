import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export async function POST(req) {
  try {
    const { template, contents } = await req.json();

    // Initialize text splitter with smaller chunks for GPT-4-mini
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 90000, // Adjusted for larger context window
      chunkOverlap: 4000, // Increased overlap for better continuity
    });

    // Split all contents into chunks
    const chunks = [];
    for (const content of contents) {
      const contentChunks = await textSplitter.splitText(content);
      chunks.push(...contentChunks);
    }

    // Define schema for different report types
    const reportSchemas = {
      "executive-summary": z.object({
        keyFindings: z
          .array(
            z.object({
              content: z.string(),
              source: z.string(),
            })
          )
          .describe("List of key findings with their sources"),
        mainInsights: z
          .array(
            z.object({
              content: z.string(),
              source: z.string(),
            })
          )
          .describe("List of main insights with their sources"),
        recommendations: z
          .array(
            z.object({
              content: z.string(),
              source: z.string(),
            })
          )
          .describe("List of recommendations with their sources"),
      }),
      "detailed-analysis": z.object({
        findings: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              evidence: z.array(z.string()),
              source: z.string(),
            })
          )
          .describe("Detailed findings with supporting evidence and sources"),
        recommendations: z
          .array(
            z.object({
              action: z.string(),
              impact: z.string(),
              timeline: z.string(),
            })
          )
          .describe("Detailed recommendations with impact assessment"),
        risks: z
          .array(
            z.object({
              description: z.string(),
              severity: z.string(),
              mitigation: z.string(),
            })
          )
          .describe("Risk analysis with mitigation strategies"),
      }),
    };

    // Initialize ChatOpenAI with structured output
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
    }).withStructuredOutput(reportSchemas[template], {
      name: "report",
      includeRaw: true,
    });

    // Process chunks sequentially with structured output
    const processedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkNumber = i + 1;
      const sourceInfo = {
        chunkNumber,
        preview: chunk.substring(0, 100),
      };

      const result = await model.invoke(
        `Analyze this content and provide a structured report. This is chunk ${chunkNumber} of ${chunks.length}. 
         Include this text as the source: "${sourceInfo.preview}...":\n\n${chunk}`
      );

      // Add source information to each item in the result
      const processedResult = addSourceInfo(result.parsed, sourceInfo);
      processedChunks.push(processedResult);
    }

    // Combine the structured outputs
    const combinedReport =
      template === "executive-summary"
        ? combineExecutiveSummaries(processedChunks)
        : combineDetailedAnalyses(processedChunks);

    // Return the structured report
    return new Response(JSON.stringify(combinedReport), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate report",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

// Helper functions to combine structured outputs
function combineExecutiveSummaries(chunks) {
  return {
    keyFindings: deduplicateByContent(chunks.flatMap((c) => c.keyFindings)),
    mainInsights: deduplicateByContent(chunks.flatMap((c) => c.mainInsights)),
    recommendations: deduplicateByContent(
      chunks.flatMap((c) => c.recommendations)
    ),
  };
}

function combineDetailedAnalyses(chunks) {
  return {
    findings: deduplicateByContent(chunks.flatMap((c) => c.findings)),
    recommendations: chunks.flatMap((c) => c.recommendations),
    risks: deduplicateByContent(chunks.flatMap((c) => c.risks)),
  };
}

// Helper function to add source info to all items in a chunk result
function addSourceInfo(result, sourceInfo) {
  const formatSource = () =>
    `Chunk ${sourceInfo.chunkNumber}: ${sourceInfo.preview}...`;

  // Deep clone the result to avoid modifying the original
  const processed = JSON.parse(JSON.stringify(result));

  // Add source to each type of item
  if (processed.keyFindings) {
    processed.keyFindings = processed.keyFindings.map((item) => ({
      ...item,
      source: formatSource(),
    }));
  }

  if (processed.mainInsights) {
    processed.mainInsights = processed.mainInsights.map((item) => ({
      ...item,
      source: formatSource(),
    }));
  }

  if (processed.recommendations) {
    processed.recommendations = processed.recommendations.map((item) => ({
      ...item,
      source: formatSource(),
    }));
  }

  if (processed.findings) {
    processed.findings = processed.findings.map((item) => ({
      ...item,
      source: formatSource(),
    }));
  }

  return processed;
}

// Update deduplication to preserve the earliest source when removing duplicates
function deduplicateByContent(array) {
  const contentMap = new Map();

  array.forEach((item) => {
    const content = item.content || item.description;
    if (!contentMap.has(content)) {
      contentMap.set(content, item);
    }
  });

  return Array.from(contentMap.values());
}
