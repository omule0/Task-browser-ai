import { z } from "zod";

const validateWordCount = (str, min = 6, max = 12) => {
  const wordCount = str.trim().split(/\s+/).length;
  return wordCount >= min && wordCount <= max;
};

export const reportSchemas = {
  Report: {
    "Research report": z.object({
      title: z.string()
        .refine(
          (str) => validateWordCount(str),
          "Title should be between 6-12 words"
        )
        .describe("Title of the research report. Should be between 6-12 words"),
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
        })
      ),
      discussion: z.object({
        interpretation: z.array(z.string()).describe("Interpretation of key findings"),
        implications: z.array(z.string()).describe("Practical or theoretical implications"),
        limitations: z.array(z.string()).describe("Study limitations and constraints"),
        futureResearch: z.array(z.string()).describe("Suggestions for future research")
      })
    }),
    "Buyside Due Diligence": z.object({
      title: z.string()
        .refine(
          (str) => validateWordCount(str),
          "Title should be between 6-12 words"
        )
        .describe("Title of the due diligence report. Should be between 6-12 words"),
      executiveSummary: z.object({
        overview: z.string().describe("High-level overview of key findings"),
        recommendation: z.string().describe("Strategic recommendation based on analysis"),
        keyRisks: z.array(z.string()).describe("Major risks identified"),
      }),
      businessOverview: z.object({
        companyProfile: z.string().describe("Company history, mission, and business model"),
        productOfferings: z.array(z.string()).describe("Key products or services"),
        marketPosition: z.string().describe("Current market position and competitive standing"),
      }),
      financialAnalysis: z.object({
        performance: z.string().describe("Historical financial performance analysis"),
        metrics: z.array(z.object({
          metric: z.string(),
          value: z.string(),
          analysis: z.string(),
        })).describe("Key financial metrics and ratios"),
        forecast: z.string().describe("Financial projections and growth outlook"),
      }),
      marketAnalysis: z.object({
        industryOverview: z.string().describe("Market size, trends, and dynamics"),
        competitiveLandscape: z.array(z.object({
          competitor: z.string(),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
        })).describe("Analysis of key competitors"),
        swotAnalysis: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          opportunities: z.array(z.string()),
          threats: z.array(z.string()),
        }),
      }),
      operationalAssessment: z.object({
        processes: z.string().describe("Key operational processes and capabilities"),
        efficiency: z.string().describe("Operational efficiency analysis"),
        improvements: z.array(z.string()).describe("Potential areas for improvement"),
      }),
      riskAssessment: z.array(z.object({
        category: z.string(),
        risks: z.array(z.string()),
        mitigation: z.string(),
      })).describe("Detailed risk analysis by category"),
      recommendations: z.object({
        dealConsiderations: z.array(z.string()).describe("Key considerations for the deal"),
        nextSteps: z.array(z.string()).describe("Recommended next steps"),
        valueCreation: z.array(z.string()).describe("Post-acquisition value creation opportunities"),
      }),
    }),
  },
};

export const getSchema = (type, subType) => {
  return reportSchemas[type]?.[subType];
};