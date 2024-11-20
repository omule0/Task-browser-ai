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
    "Sellside Due Diligence": z.object({
      title: z.string()
        .refine(
          (str) => validateWordCount(str),
          "Title should be between 6-12 words"
        )
        .describe("Title of the sellside due diligence report. Should be between 6-12 words"),
      executiveSummary: z.object({
        description: z.string().describe("A high-level overview of the company being sold, highlighting its key strengths, market position, growth opportunities, and any notable risks."),
        purpose: z.string().describe("To provide potential buyers with a snapshot of the business and outline why it presents a valuable opportunity for acquisition."),
      }),
      companyOverview: z.object({
        description: z.string().describe("This section covers the company's history, mission, products or services, markets served, and key differentiators."),
        purpose: z.string().describe("To offer a detailed context for understanding the core aspects of the business."),
      }),
      financialOverview: z.object({
        description: z.string().describe("This section presents a thorough analysis of the company's historical financial statements and key financial ratios."),
        purpose: z.string().describe("To give potential buyers an accurate view of the company's financial health, profitability, and growth trajectory."),
      }),
      marketAndCompetitiveLandscape: z.object({
        description: z.string().describe("An analysis of the target company's market dynamics, size, growth trends, key competitors, and market share."),
        purpose: z.string().describe("To help buyers understand the external environment in which the company operates and its competitive advantages."),
      }),
      productOrServicePortfolio: z.object({
        description: z.string().describe("Detailed information about the company's products or services, including key features, sales performance, market adoption, and any ongoing R&D efforts."),
        purpose: z.string().describe("To illustrate the value and market fit of the company's offerings and highlight any unique capabilities or innovations."),
      }),
      customerAndSalesAnalysis: z.object({
        description: z.string().describe("A review of the company's customer base, sales channels, customer retention rates, and major contracts or partnerships."),
        purpose: z.string().describe("To demonstrate the company's market reach, customer loyalty, and revenue-generating capabilities."),
      }),
      operationalOverview: z.object({
        description: z.string().describe("Analysis of the company's operational processes, supply chain management, technology infrastructure, and key operational metrics."),
        purpose: z.string().describe("To give potential buyers a clear view of the company's operational efficiency and scalability."),
      }),
      legalAndRegulatoryReview: z.object({
        description: z.string().describe("A summary of the company's legal structure, key contracts, intellectual property holdings, compliance status, litigation history, and any regulatory issues."),
        purpose: z.string().describe("To provide transparency regarding legal and compliance risks that could impact the transaction or future operations."),
      }),
      humanResourcesAndWorkforceAssessment: z.object({
        description: z.string().describe("An overview of the company's workforce, including employee demographics, compensation structures, key leaders, and labor relations."),
        purpose: z.string().describe("To showcase the company's talent pool and identify any labor-related risks or opportunities."),
      }),
      technologyAndIntellectualProperty: z.object({
        description: z.string().describe("Detailed information on the company's IT infrastructure, software systems, data security measures, and intellectual property assets."),
        purpose: z.string().describe("To highlight the company's technological capabilities and IP assets that could add significant value to the buyer."),
      }),
      esgPractices: z.object({
        description: z.string().describe("An evaluation of the company's ESG practices, including sustainability initiatives, corporate governance policies, diversity and inclusion efforts, and community engagement."),
        purpose: z.string().describe("To demonstrate the company's commitment to responsible business practices, which can influence buyer perception and valuation."),
      }),
      riskAssessment: z.object({
        description: z.string().describe("An identification and analysis of potential risks facing the company, including market, financial, operational, regulatory, and reputational risks."),
        purpose: z.string().describe("To ensure that potential buyers are aware of significant risks and how they can be managed or minimized."),
      }),
      valuationHighlightsAndStrategicOpportunities: z.object({
        description: z.string().describe("A summary of the company's valuation, including key value drivers, comparable company analysis, and potential synergies for strategic buyers."),
        purpose: z.string().describe("To provide a rationale for the company's valuation and demonstrate its strategic fit for prospective buyers."),
      }),
      appendices: z.object({
        description: z.string().describe("Supporting documents such as detailed financial statements, customer contracts, patents, legal filings, organizational charts, and other relevant information."),
        purpose: z.string().describe("To offer additional context and support for the claims and data presented in the report."),
      }),
    }),
    "Business Plan": z.object({
      title: z.string()
        .refine(
          (str) => validateWordCount(str),
          "Title should be between 6-12 words"
        )
        .describe("Title of the business plan. Should be between 6-12 words"),
      executiveSummary: z.object({
        description: z.string().describe("High-level overview of the entire business plan"),
        purpose: z.string().describe("Provides potential investors or partners with a quick snapshot of the business"),
      }),
      businessDescriptionAndVision: z.object({
        description: z.string().describe("Details the business concept, vision, mission, values, and long-term goals"),
        purpose: z.string().describe("Establishes the purpose and strategic direction of the company"),
      }),
      marketAnalysis: z.object({
        description: z.string().describe("Analysis of the industry landscape, target market, and competitors"),
        purpose: z.string().describe("To show potential market demand and highlight the business’s unique value proposition"),
      }),
      productsOrServices: z.object({
        description: z.string().describe("Detailed description of the products or services offered by the company"),
        purpose: z.string().describe("To provide a clear understanding of what the company is selling"),
      }),
      marketingAndSalesStrategy: z.object({
        description: z.string().describe("Outlines the business’s approach to reaching its target market"),
        purpose: z.string().describe("To describe how the company plans to attract and retain customers"),
      }),
      operationsPlan: z.object({
        description: z.string().describe("Details the day-to-day operational structure"),
        purpose: z.string().describe("To explain how the business will operate"),
      }),
      managementAndOrganization: z.object({
        description: z.string().describe("Overview of the company’s organizational structure and key personnel"),
        purpose: z.string().describe("To highlight the experience and expertise of the management team"),
      }),
      financialPlanAndProjections: z.object({
        description: z.string().describe("Presents detailed financial projections and funding requirements"),
        purpose: z.string().describe("To provide a comprehensive overview of the business’s financial health"),
      }),
      fundingRequest: z.object({
        description: z.string().describe("Specifies the amount of funding needed and how it will be used"),
        purpose: z.string().describe("To outline the specific funding requirements"),
      }).optional(),
      appendix: z.object({
        description: z.string().describe("Contains additional documentation and support materials"),
        purpose: z.string().describe("To provide supplementary information that supports the claims and data presented"),
      }),
    }),
  },
};

export const getSchema = (type, subType) => {
  return reportSchemas[type]?.[subType];
};