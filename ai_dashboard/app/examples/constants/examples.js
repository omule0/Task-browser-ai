import {FileText, Building2, Target, Wallet, AlertTriangle, Scale, BookOpen, Globe, BarChart3, Shield, TrendingUp, Briefcase } from "lucide-react";

export const exampleReports = {
    "credit-investment-analysis": {
      title: "Credit Investment Analysis Report",
      description: "AI-generated credit and investment analysis report",
      content: [
        {
          section: "Executive Summary",
          icon: <BookOpen className="w-6 h-6 text-blue-600" />,
          content: {
            overview: "This report evaluates Credit Suisse's financial health, market position, and risk factors, providing a comprehensive analysis of its creditworthiness.",
            creditRating: "OUTPERFORM - The stock is expected to outperform the relevant benchmark over the next 12 months based on strong order book replenishment prospects.",
            riskAssessment: "The main risks include changes in government policy, increased payment risks from customers, and spikes in raw material prices.",
            financialPosition: "As of Q1 2023, Credit Suisse reported a net profit of RM27.8 million, which is 18% of street estimates, indicating a weaker performance primarily due to its construction division."
          }
        },
        {
          section: "Borrower Profile",
          icon: <Building2 className="w-6 h-6 text-gray-600" />,
          content: {
            background: "Credit Suisse has a long-standing history in the financial services industry, providing a range of investment banking and asset management services.",
            businessModel: "The core business model focuses on investment banking, wealth management, and asset management, with a strong emphasis on client relationships.",
            structure: "The organizational structure is designed to support its diverse service offerings, with dedicated teams for investment banking and asset management.",
            marketPosition: "Credit Suisse maintains a competitive position in the financial services market, leveraging its global presence and expertise."
          }
        },
        {
          section: "Industry Analysis",
          icon: <Globe className="w-6 h-6 text-green-600" />,
          content: {
            overview: "The financial services industry is currently facing challenges due to economic fluctuations and regulatory changes, impacting overall performance.",
            trends: [
              "Increased focus on sustainable investing",
              "Regulatory changes affecting capital requirements",
              "Technological advancements in financial services"
            ],
            factors: [
              "Economic recovery post-pandemic",
              "Geopolitical tensions affecting market stability",
              "Interest rate fluctuations impacting profitability"
            ],
            competition: "The competitive landscape includes major global banks and emerging fintech companies, intensifying the need for innovation and customer engagement."
          }
        },
        {
          section: "Credit Metrics",
          icon: <Target className="w-6 h-6 text-purple-600" />,
          content: {
            debtStructure: "The capital structure is primarily equity-based with minimal debt exposure, enhancing financial stability.",
            maturityProfile: "The debt maturity profile is favorable, with no significant obligations due in the near term.",
            metrics: [
              {
                metric: "Debt to Equity Ratio",
                value: "0.1",
                analysis: "A low debt to equity ratio indicates a conservative approach to leveraging."
              },
              {
                metric: "Interest Coverage Ratio",
                value: "10.5",
                analysis: "The interest coverage ratio suggests strong ability to meet interest obligations."
              }
            ]
          }
        },
        {
          section: "Financial Analysis",
          icon: <BarChart3 className="w-6 h-6 text-yellow-600" />,
          content: {
            ratios: [
              {
                category: "Profitability",
                metrics: [
                  {
                    name: "Net Profit Margin",
                    value: "6.3%",
                    analysis: "The net profit margin has decreased due to lower revenues in the construction segment."
                  },
                  {
                    name: "Return on Equity",
                    value: "18.8%",
                    analysis: "ROE remains strong, reflecting effective management of equity capital."
                  }
                ]
              },
              {
                category: "Liquidity",
                metrics: [
                  {
                    name: "Current Ratio",
                    value: "1.5",
                    analysis: "The current ratio indicates a strong liquidity position, ensuring short-term obligations can be met."
                  }
                ]
              }
            ],
            performance: {
              income: "The income statement shows a decline in net profit by 19.4% YoY, primarily due to weaker performance in the construction division.",
              balance: "The balance sheet remains robust with a healthy order book of RM6 billion and a net debt to equity ratio of -11.2%.",
              cashflow: "Cash flow analysis indicates a stable operating cash flow, although capital expenditures are expected to increase with new projects."
            }
          }
        },
        {
          section: "Cash Flow Analysis",
          icon: <Wallet className="w-6 h-6 text-green-600" />,
          content: {
            operatingCashFlow: "Operating cash flow remains positive, supporting ongoing operations and investments.",
            capitalExpenditures: "Capital expenditures are projected to increase as new projects are initiated.",
            freeCashFlow: "Free cash flow is expected to remain stable, providing flexibility for future investments.",
            liquidity: "Liquidity position is assessed as strong, with sufficient cash reserves to cover short-term liabilities."
          }
        },
        {
          section: "Risk Assessment",
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          content: [
            {
              category: "Market Risk",
              risks: ["Economic downturns", "Regulatory changes"],
              mitigation: "Diversification of services and geographic presence to reduce exposure."
            },
            {
              category: "Operational Risk",
              risks: ["Project delays", "Cost overruns"],
              mitigation: "Implementing robust project management practices and contingency planning."
            }
          ]
        },
        {
          section: "Covenant Review",
          icon: <Shield className="w-6 h-6 text-purple-600" />,
          content: {
            compliance: "Covenant compliance is currently satisfactory, with no breaches reported.",
            restrictions: [
              "Limitations on additional borrowing",
              "Restrictions on asset sales"
            ],
            legalIssues: [
              "Ongoing regulatory reviews",
              "Pending litigation matters"
            ]
          }
        },
        {
          section: "ESG Analysis",
          icon: <Scale className="w-6 h-6 text-green-600" />,
          content: {
            environmental: [
              "Commitment to reducing carbon footprint",
              "Investment in renewable energy projects"
            ],
            social: [
              "Community engagement initiatives",
              "Diversity and inclusion programs"
            ],
            governance: [
              "Strong corporate governance practices",
              "Transparency in reporting"
            ]
          }
        },
        {
          section: "Scenario Analysis",
          icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
          content: [
            {
              scenario: "Economic Recovery",
              assumptions: [
                "Stable interest rates",
                "Increased consumer spending"
              ],
              impact: "Positive impact on revenue growth and profitability."
            },
            {
              scenario: "Market Downturn",
              assumptions: [
                "Increased unemployment",
                "Decreased consumer confidence"
              ],
              impact: "Negative impact on revenue and potential project delays."
            }
          ]
        },
        {
          section: "Comparative Analysis",
          icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
          content: [
            {
              peer: "Peer Company A",
              metrics: [
                {
                  metric: "P/E Ratio",
                  value: "15.0",
                  comparison: "Credit Suisse's P/E ratio is higher, indicating a premium valuation."
                },
                {
                  metric: "ROE",
                  value: "17.0%",
                  comparison: "Credit Suisse outperforms in ROE, reflecting better management efficiency."
                }
              ]
            }
          ]
        },
        {
          section: "Investment Recommendation",
          icon: <Target className="w-6 h-6 text-blue-600" />,
          content: {
            recommendation: "INVEST",
            rationale: "The strong order book and positive market outlook support a favorable investment thesis.",
            targetYield: "Expected target yield range of 5-7%."
          }
        },
        {
          section: "Appendix",
          icon: <FileText className="w-6 h-6 text-gray-600" />,
          content: [
            {
              type: "financial",
              title: "Financial Statements",
              content: "Detailed financial statements for the last three years."
            },
            {
              type: "market",
              title: "Market Analysis Report",
              content: "Comprehensive market analysis and competitive landscape overview."
            }
          ]
        }
      ]
    },
  };