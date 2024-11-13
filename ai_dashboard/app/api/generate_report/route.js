import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export async function POST(req) {
  try {
    const { documentType, subType, content, selectedFiles, fileContents } = await req.json();

    console.log("documentType", documentType);
    console.log("subType", subType);
    console.log("content", content);
    console.log("selectedFiles", selectedFiles);
    console.log("fileContents", fileContents);

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
    const getSchema = (type, subType) => {
      const baseSchema = {
        Report: {
          "Student report": z.object({
            academicProgress: z.array(
              z.object({
                area: z.string().describe("Area of study or skill"),
                achievement: z.string().describe("Specific achievements and progress"),
                evidence: z.array(z.string()).describe("Supporting evidence from source documents")
              })
            ),
            recommendations: z.array(
              z.object({
                suggestion: z.string().describe("Specific recommendation for improvement"),
                rationale: z.string().describe("Reasoning behind the recommendation"),
                implementation: z.string().describe("How to implement the recommendation")
              })
            ),
            summary: z.string().describe("Overall summary of the student's performance")
          }),
          "Research report": z.object({
            methodology: z.object({
              approach: z.string(),
              dataCollection: z.string(),
              analysis: z.string()
            }),
            findings: z.array(
              z.object({
                key: z.string().describe("Key finding"),
                evidence: z.array(z.string()),
                implications: z.string()
              })
            ),
            conclusions: z.array(z.string()),
            recommendations: z.array(
              z.object({
                recommendation: z.string(),
                justification: z.string()
              })
            )
          }),
          "Annual report": z.object({
            executiveSummary: z.string(),
            financialHighlights: z.array(
              z.object({
                metric: z.string(),
                value: z.string(),
                analysis: z.string()
              })
            ),
            achievements: z.array(
              z.object({
                category: z.string(),
                accomplishments: z.array(z.string())
              })
            ),
            futureOutlook: z.object({
              opportunities: z.array(z.string()),
              challenges: z.array(z.string()),
              strategies: z.array(z.string())
            })
          })
        },
        Proposal: {
          "Project proposal": z.object({
            executiveSummary: z.string(),
            projectScope: z.object({
              objectives: z.array(z.string()),
              deliverables: z.array(z.string()),
              constraints: z.array(z.string())
            }),
            methodology: z.string(),
            timeline: z.array(
              z.object({
                phase: z.string(),
                duration: z.string(),
                activities: z.array(z.string())
              })
            ),
            budget: z.array(
              z.object({
                category: z.string(),
                amount: z.string(),
                justification: z.string()
              })
            )
          }),
          "Sales proposal": z.object({
            summary: z.string(),
            clientNeeds: z.array(
              z.object({
                need: z.string(),
                solution: z.string()
              })
            ),
            proposedSolution: z.object({
              overview: z.string(),
              benefits: z.array(z.string()),
              features: z.array(
                z.object({
                  name: z.string(),
                  description: z.string(),
                  value: z.string()
                })
              )
            }),
            pricing: z.array(
              z.object({
                item: z.string(),
                cost: z.string(),
                details: z.string()
              })
            )
          })
        }
      };

      return baseSchema[type]?.[subType];
    };

    const schema = getSchema(documentType, subType);
    if (!schema) {
      throw new Error("Invalid document type or subtype");
    }

    // Initialize ChatOpenAI with structured output
    const model = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0,
    }).withStructuredOutput(schema);

    // Process chunks and generate report
    const processedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const result = await model.invoke(
        `Generate a ${subType} based on the following content and requirements: ${content}
         
         Source document content:
         ${chunk}
         
         Please ensure the report follows the required structure and incorporates relevant information from the source document.`
      );
      processedChunks.push(result);
    }

    // Combine the results
    const combinedReport = combineReports(processedChunks, documentType, subType);

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

function combineReports(chunks, documentType, subType) {
  // Implement combining logic based on document type and subtype
  // This is a simplified example
  const combined = chunks.reduce((acc, chunk) => {
    Object.entries(chunk).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = [...(acc[key] || []), ...value];
      } else if (typeof value === 'object') {
        acc[key] = { ...(acc[key] || {}), ...value };
      } else {
        acc[key] = acc[key] ? `${acc[key]}\n${value}` : value;
      }
    });
    return acc;
  }, {});

  console.log("combined", combined);

  return combined;

}