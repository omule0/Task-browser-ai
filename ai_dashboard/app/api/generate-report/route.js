import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChatOpenAI } from '@langchain/openai';
import { z } from "zod";

export async function POST(req) {
  try {
    const { template, contents, workspaceId } = await req.json();

    // Initialize text splitter with smaller chunks for GPT-4-mini
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000, 
      chunkOverlap: 300, 
    });

    // Split all contents into chunks
    const chunks = [];
    for (const content of contents) {
      const contentChunks = await textSplitter.splitText(content);
      chunks.push(...contentChunks);
    }

    // Define schema for different report types
    const reportSchemas = {
      'executive-summary': z.object({
        keyFindings: z.array(z.string()).describe("List of key findings from the content"),
        mainInsights: z.array(z.string()).describe("List of main insights derived from the analysis"),
        recommendations: z.array(z.string()).describe("List of actionable recommendations")
      }),
      'detailed-analysis': z.object({
        findings: z.array(z.object({
          title: z.string(),
          description: z.string(),
          evidence: z.array(z.string())
        })).describe("Detailed findings with supporting evidence"),
        recommendations: z.array(z.object({
          action: z.string(),
          impact: z.string(),
          timeline: z.string()
        })).describe("Detailed recommendations with impact assessment"),
        risks: z.array(z.object({
          description: z.string(),
          severity: z.string(),
          mitigation: z.string()
        })).describe("Risk analysis with mitigation strategies")
      })
    };

    // Initialize ChatOpenAI with structured output
    const model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
    }).withStructuredOutput(reportSchemas[template], {
      name: "report",
      includeRaw: true
    });

    // Process chunks sequentially with structured output
    const processedChunks = [];
    for (const chunk of chunks) {
      const result = await model.invoke(
        `Analyze this content and provide a structured report:\n\n${chunk}`
      );
      processedChunks.push(result.parsed); // Using .parsed to get the structured data
    }

    // Combine the structured outputs
    const combinedReport = template === 'executive-summary' 
      ? combineExecutiveSummaries(processedChunks)
      : combineDetailedAnalyses(processedChunks);

    // Return the structured report
    return new Response(JSON.stringify(combinedReport), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate report',
        details: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Helper functions to combine structured outputs
function combineExecutiveSummaries(chunks) {
  return {
    keyFindings: [...new Set(chunks.flatMap(c => c.keyFindings))],
    mainInsights: [...new Set(chunks.flatMap(c => c.mainInsights))],
    recommendations: [...new Set(chunks.flatMap(c => c.recommendations))]
  };
}

function combineDetailedAnalyses(chunks) {
  return {
    findings: chunks.flatMap(c => c.findings),
    recommendations: chunks.flatMap(c => c.recommendations),
    risks: [...new Set(chunks.flatMap(c => c.risks))]
  };
}