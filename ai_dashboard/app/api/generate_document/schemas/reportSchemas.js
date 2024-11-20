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
        overview: z.string().describe("High-level overview of the company and key strengths"),
        marketPosition: z.string().describe("Company's market position and growth opportunities"),
        keyHighlights: z.array(z.string()).describe("Notable strengths and opportunities"),
      }),
      companyOverview: z.object({
        history: z.string().describe("Company history and background"),
        mission: z.string().describe("Company mission and strategic goals"),
        structure: z.string().describe("Organizational structure and corporate culture"),
      }),
      financialOverview: z.object({
        performance: z.string().describe("Historical financial performance analysis"),
        metrics: z.array(z.object({
          metric: z.string(),
          value: z.string(),
          analysis: z.string(),
        })).describe("Key financial metrics and trends"),
        projections: z.string().describe("Financial projections and growth outlook"),
      }),
      marketAnalysis: z.object({
        industryOverview: z.string().describe("Market size, dynamics, and growth trends"),
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
      productPortfolio: z.object({
        products: z.array(z.object({
          name: z.string(),
          description: z.string(),
          performance: z.string(),
        })).describe("Details of products/services offered"),
        rdInitiatives: z.array(z.string()).describe("Ongoing R&D efforts and innovations"),
      }),
      customerAnalysis: z.object({
        segments: z.array(z.string()).describe("Key market segments served"),
        relationships: z.string().describe("Customer retention and relationship analysis"),
        pipeline: z.string().describe("Sales pipeline and growth opportunities"),
      }),
      operationalOverview: z.object({
        processes: z.string().describe("Key operational processes and capabilities"),
        infrastructure: z.string().describe("Technology and operational infrastructure"),
        metrics: z.array(z.string()).describe("Key operational performance metrics"),
      }),
      legalRegulatory: z.object({
        structure: z.string().describe("Legal structure and compliance status"),
        intellectualProperty: z.array(z.string()).describe("IP holdings and protection"),
        compliance: z.array(z.string()).describe("Regulatory compliance and issues"),
      }),
      humanResources: z.object({
        workforce: z.string().describe("Workforce overview and demographics"),
        leadership: z.array(z.object({
          position: z.string(),
          experience: z.string(),
        })).describe("Key leadership profiles"),
        culture: z.string().describe("Company culture and employee relations"),
      }),
      esgPractices: z.object({
        environmental: z.array(z.string()).describe("Environmental initiatives and impact"),
        social: z.array(z.string()).describe("Social responsibility programs"),
        governance: z.array(z.string()).describe("Corporate governance practices"),
      }),
      riskAssessment: z.array(z.object({
        category: z.string(),
        risks: z.array(z.string()),
        mitigation: z.string(),
      })).describe("Detailed risk analysis by category"),
      valuationHighlights: z.object({
        valueDrivers: z.array(z.string()).describe("Key value drivers"),
        opportunities: z.array(z.string()).describe("Growth and strategic opportunities"),
        synergies: z.array(z.string()).describe("Potential synergies for buyers"),
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
        overview: z.string().describe("High-level overview of the business plan"),
        mission: z.string().describe("Company's mission statement"),
        highlights: z.array(z.string()).describe("Key financial and business highlights"),
        objectives: z.array(z.string()).describe("Primary business objectives")
      }),
      businessDescription: z.object({
        concept: z.string().describe("Detailed business concept and vision"),
        legalStructure: z.string().describe("Legal structure of the business"),
        history: z.string().describe("Company history and milestones"),
        values: z.array(z.string()).describe("Core company values")
      }),
      marketAnalysis: z.object({
        industryOverview: z.string().describe("Analysis of industry landscape and trends"),
        targetMarket: z.object({
          demographics: z.array(z.string()).describe("Target customer demographics"),
          needs: z.array(z.string()).describe("Customer needs and pain points"),
          size: z.string().describe("Market size and potential")
        }),
        competitiveAnalysis: z.array(z.object({
          competitor: z.string(),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string())
        })).describe("Analysis of key competitors")
      }),
      productsServices: z.object({
        offerings: z.array(z.object({
          name: z.string(),
          description: z.string(),
          features: z.array(z.string()),
          pricing: z.string()
        })).describe("Details of products or services offered"),
        rdPlans: z.array(z.string()).describe("Future development and R&D plans")
      }),
      marketingStrategy: z.object({
        channels: z.array(z.string()).describe("Marketing and distribution channels"),
        tactics: z.array(z.string()).describe("Marketing and advertising tactics"),
        pricing: z.string().describe("Pricing strategy"),
        retention: z.string().describe("Customer retention strategy")
      }),
      operationsPlan: z.object({
        location: z.string().describe("Business location and facilities"),
        processes: z.string().describe("Operational processes and systems"),
        suppliers: z.array(z.string()).describe("Key suppliers and partnerships"),
        technology: z.string().describe("Technology infrastructure")
      }),
      management: z.object({
        structure: z.string().describe("Organizational structure"),
        team: z.array(z.object({
          role: z.string(),
          qualifications: z.string(),
          responsibilities: z.array(z.string())
        })).describe("Key management team members")
      }),
      financialPlan: z.object({
        projections: z.object({
          revenue: z.string().describe("Revenue projections"),
          expenses: z.string().describe("Expense projections"),
          profitability: z.string().describe("Profitability analysis")
        }),
        metrics: z.array(z.object({
          metric: z.string(),
          value: z.string(),
          analysis: z.string()
        })).describe("Key financial metrics"),
        funding: z.object({
          requirements: z.string().describe("Funding requirements"),
          use: z.array(z.string()).describe("Use of funds"),
          terms: z.string().describe("Preferred funding terms")
        })
      }),
      riskAnalysis: z.array(z.object({
        category: z.string(),
        risks: z.array(z.string()),
        mitigation: z.string()
      })).describe("Analysis of business risks and mitigation strategies"),
      appendix: z.array(z.object({
        title: z.string(),
        content: z.string(),
        type: z.string()
      })).describe("Supporting documentation and materials")
    }),
    "Equity Investment Analyst": z.object({
      title: z.string()
        .refine(
          (str) => validateWordCount(str),
          "Title should be between 6-12 words"
        )
        .describe("Title of the equity investment analyst report"),
      
      executiveSummary: z.object({
        overview: z.string().describe("High-level overview of key findings"),
        investmentThesis: z.string().describe("Core investment thesis"),
        recommendation: z.object({
          type: z.enum(["buy", "hold", "sell"]).describe("Investment recommendation"),
          rationale: z.string().describe("Reasoning behind recommendation"),
          targetPrice: z.string().describe("Target price range for the stock")
        }),
        keyPoints: z.array(z.string()).describe("Summary of main analysis points")
      }),

      companyOverview: z.object({
        businessModel: z.string().describe("Company's business model description"),
        history: z.string().describe("Company history and background"),
        products: z.array(z.string()).describe("Key products or service lines"),
        geographicPresence: z.string().describe("Geographical market presence"),
        competitiveAdvantages: z.array(z.string()).describe("Key competitive advantages")
      }),

      industryAnalysis: z.object({
        marketSize: z.string().describe("Total addressable market size"),
        trends: z.array(z.string()).describe("Key industry trends"),
        growthDrivers: z.array(z.string()).describe("Market growth drivers"),
        regulatoryEnvironment: z.string().describe("Regulatory landscape"),
        swotAnalysis: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          opportunities: z.array(z.string()),
          threats: z.array(z.string())
        })
      }),

      financialAnalysis: z.object({
        performance: z.object({
          revenue: z.string().describe("Revenue analysis"),
          profitability: z.string().describe("Profitability analysis"),
          cashFlow: z.string().describe("Cash flow analysis")
        }),
        ratios: z.array(z.object({
          category: z.string(),
          metrics: z.array(z.object({
            name: z.string(),
            value: z.string(),
            analysis: z.string()
          }))
        })).describe("Key financial ratios"),
        trends: z.array(z.string()).describe("Notable financial trends")
      }),

      valuationAnalysis: z.object({
        methodologies: z.array(z.object({
          type: z.string(),
          value: z.string(),
          assumptions: z.array(z.string())
        })).describe("Valuation methodologies used"),
        peerComparison: z.array(z.object({
          company: z.string(),
          metrics: z.array(z.object({
            name: z.string(),
            value: z.string()
          }))
        })).describe("Peer company comparisons"),
        fairValue: z.string().describe("Estimated fair value range")
      }),

      businessStrategy: z.object({
        model: z.string().describe("Business model analysis"),
        initiatives: z.array(z.string()).describe("Key strategic initiatives"),
        management: z.string().describe("Management effectiveness assessment")
      }),

      riskAssessment: z.array(z.object({
        category: z.string(),
        risks: z.array(z.string()),
        mitigation: z.string()
      })).describe("Key risk factors and mitigation strategies"),

      competitiveAnalysis: z.object({
        marketShare: z.string().describe("Company's market position"),
        competitors: z.array(z.object({
          name: z.string(),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string())
        })).describe("Competitor analysis")
      }),

      esgAnalysis: z.object({
        environmental: z.array(z.string()).describe("Environmental initiatives and impact"),
        social: z.array(z.string()).describe("Social responsibility programs"),
        governance: z.array(z.string()).describe("Corporate governance practices"),
        rating: z.string().describe("Overall ESG assessment")
      }),

      investmentConsiderations: z.object({
        risks: z.array(z.string()).describe("Key investment risks"),
        opportunities: z.array(z.string()).describe("Growth opportunities"),
        catalysts: z.array(z.string()).describe("Potential value catalysts")
      }),

      appendix: z.array(z.object({
        title: z.string(),
        content: z.string(),
        type: z.string()
      })).describe("Supporting documentation and materials")
    }),
  },
};

export const getSchema = (type, subType) => {
  return reportSchemas[type]?.[subType];
};