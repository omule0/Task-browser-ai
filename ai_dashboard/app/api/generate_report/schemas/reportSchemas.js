import { z } from "zod";

export const reportSchemas = {
  Report: {
    "Research report": z.object({
      introduction: z.object({
        context: z.string().describe("Background and context of the research"),
        objectives: z.array(z.string()).describe("Research objectives or questions"),
        significance: z.string().describe("Importance and relevance of the research")
      }),
      methodology: z.object({
        researchDesign: z.string().describe("Overall research approach and design"),
        participants: z.string().describe("Description of study participants or data sources"),
        dataCollection: z.string().describe("Methods used to collect data"),
        analysisMethod: z.string().describe("Techniques used to analyze the data")
      }),
      results: z.array(
        z.object({
          finding: z.string().describe("Key research finding"),
          evidence: z.array(z.string()).describe("Supporting data or observations"),
          visualization: z.string().optional().describe("Description of any tables, graphs, or statistics")
        })
      ),
      discussion: z.object({
        interpretation: z.array(z.string()).describe("Interpretation of key findings"),
        implications: z.array(z.string()).describe("Practical or theoretical implications"),
        limitations: z.array(z.string()).describe("Study limitations and constraints"),
        futureResearch: z.array(z.string()).describe("Suggestions for future research")
      })
    }),
  },
};

export const getSchema = (type, subType) => {
  return reportSchemas[type]?.[subType];
};