"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, ExternalLink, Building2, Target, Wallet, AlertTriangle, Scale, BookOpen, Globe, BarChart3, Shield, TrendingUp, Briefcase } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const exampleReports = {
  "credit-investment-analysis": {
    title: "Credit Suisse Investment Analysis",
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

export default function ExamplesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedReport, setSelectedReport] = useState("credit-investment-analysis");

  useEffect(() => {
    const reportParam = searchParams.get('report');
    if (reportParam && exampleReports[reportParam]) {
      setSelectedReport(reportParam);
    }
  }, [searchParams]);

  const currentReport = exampleReports[selectedReport] || exampleReports["credit-investment-analysis"];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">Example AI Reports</h1>
        <p className="text-gray-600">
          See how our AI analyzes different types of business documents and generates insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-4 lg:col-span-1">
          <h2 className="font-semibold mb-4">Report Types</h2>
          <div className="space-y-2">
            {Object.entries(exampleReports).map(([key, report]) => (
              <Button
                key={key}
                variant={selectedReport === key ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedReport(key)}
              >
                <FileText className="w-4 h-4 mr-2" />
                {report.title}
              </Button>
            ))}
          </div>
        </Card>

        {/* Main Content */}
        <motion.div
          key={selectedReport}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {currentReport.title}
                </h2>
                <p className="text-gray-600">
                  {currentReport.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Try with your data
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {currentReport.content.map((section, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {section.icon}
                    <h3 className="text-lg font-semibold">{section.section}</h3>
                  </div>
                  
                  {section.section === "Borrower Profile" && (
                    <div className="space-y-4">
                      {Object.entries(section.content).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-medium mb-2">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                          <p className="text-gray-600">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.section === "Credit Metrics" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Debt Structure</h4>
                        <p className="text-gray-600">{section.content.debtStructure}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Credit Metrics</h4>
                        {section.content.metrics.map((metric, idx) => (
                          <div key={idx} className="mb-4 border-b pb-2">
                            <p className="font-medium">{metric.metric}: {metric.value}</p>
                            <p className="text-sm text-gray-600">{metric.analysis}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.section === "Risk Assessment" && (
                    <div className="space-y-4">
                      {section.content.map((risk, idx) => (
                        <div key={idx} className="border p-4 rounded-lg">
                          <h4 className="font-medium mb-2">{risk.category}</h4>
                          <div className="space-y-2">
                            <div>
                              <h5 className="text-sm font-medium">Risks:</h5>
                              <ul className="list-disc pl-5">
                                {risk.risks.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium">Mitigation:</h5>
                              <p className="text-gray-600">{risk.mitigation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.section === "ESG Analysis" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(section.content).map(([key, items]) => (
                        <div key={key}>
                          <h4 className="font-medium mb-2">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                          <ul className="list-disc pl-5">
                            {items.map((item, i) => (
                              <li key={i} className="text-gray-600">{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.section === "Financial Analysis" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-4">Performance Metrics</h4>
                        {section.content.ratios.map((ratio, idx) => (
                          <div key={idx} className="mb-6">
                            <h5 className="text-sm font-medium text-gray-600 mb-3">{ratio.category}</h5>
                            <div className="space-y-4">
                              {ratio.metrics.map((metric, i) => (
                                <div key={i} className="border-b pb-3">
                                  <p className="font-medium">{metric.name}: {metric.value}</p>
                                  <p className="text-sm text-gray-600">{metric.analysis}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium mb-4">Performance Overview</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium">Income Statement</h5>
                            <p className="text-gray-600">{section.content.performance.income}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium">Balance Sheet</h5>
                            <p className="text-gray-600">{section.content.performance.balance}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium">Cash Flow</h5>
                            <p className="text-gray-600">{section.content.performance.cashflow}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.section === "Cash Flow Analysis" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Operating Cash Flow</h4>
                        <p className="text-gray-600">{section.content.operatingCashFlow}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Capital Expenditures</h4>
                        <p className="text-gray-600">{section.content.capitalExpenditures}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Free Cash Flow</h4>
                        <p className="text-gray-600">{section.content.freeCashFlow}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Liquidity</h4>
                        <p className="text-gray-600">{section.content.liquidity}</p>
                      </div>
                    </div>
                  )}

                  {section.section === "Covenant Review" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Compliance Status</h4>
                        <p className="text-gray-600">{section.content.compliance}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Restrictions</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {section.content.restrictions.map((restriction, idx) => (
                            <li key={idx} className="text-gray-600">{restriction}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Legal Issues</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {section.content.legalIssues.map((issue, idx) => (
                            <li key={idx} className="text-gray-600">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {section.section === "Scenario Analysis" && (
                    <div className="space-y-4">
                      {section.content.map((scenario, idx) => (
                        <div key={idx} className="border p-4 rounded-lg">
                          <h4 className="font-medium mb-3">{scenario.scenario}</h4>
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium">Assumptions:</h5>
                              <ul className="list-disc pl-5">
                                {scenario.assumptions.map((assumption, i) => (
                                  <li key={i} className="text-gray-600">{assumption}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium">Impact:</h5>
                              <p className="text-gray-600">{scenario.impact}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.section === "Investment Recommendation" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Recommendation</h4>
                        <p className="uppercase font-bold text-blue-600">{section.content.recommendation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Rationale</h4>
                        <p className="text-gray-600">{section.content.rationale}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Target Yield</h4>
                        <p className="text-gray-600">{section.content.targetYield}</p>
                      </div>
                    </div>
                  )}

                  {section.section === "Appendix" && (
                    <div className="space-y-4">
                      {section.content.map((item, idx) => (
                        <div key={idx} className="border p-4 rounded-lg">
                          <h4 className="font-medium mb-2">{item.title}</h4>
                          <p className="mb-2 text-gray-600">{item.content}</p>
                          <p className="text-sm text-gray-600">Type: {item.type}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.section === "Executive Summary" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Overview</h4>
                        <p className="text-gray-600">{section.content.overview}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Credit Rating</h4>
                        <p className="text-blue-600 font-semibold">{section.content.creditRating}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Risk Assessment</h4>
                        <p className="text-gray-600">{section.content.riskAssessment}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Financial Position</h4>
                        <p className="text-gray-600">{section.content.financialPosition}</p>
                      </div>
                    </div>
                  )}

                  {section.section === "Industry Analysis" && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Overview</h4>
                        <p className="text-gray-600">{section.content.overview}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Industry Trends</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {section.content.trends.map((trend, idx) => (
                            <li key={idx} className="text-gray-600">{trend}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">Key Factors</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {section.content.factors.map((factor, idx) => (
                            <li key={idx} className="text-gray-600">{factor}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Competitive Landscape</h4>
                        <p className="text-gray-600">{section.content.competition}</p>
                      </div>
                    </div>
                  )}

                  {section.section === "Comparative Analysis" && (
                    <div className="space-y-4">
                      {section.content.map((peer, idx) => (
                        <div key={idx} className="border p-4 rounded-lg">
                          <h4 className="font-medium mb-3">{peer.peer}</h4>
                          <div className="space-y-3">
                            {peer.metrics.map((metric, i) => (
                              <div key={i} className="border-b pb-3 last:border-b-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{metric.metric}</span>
                                  <span className="text-blue-600">{metric.value}</span>
                                </div>
                                <p className="text-sm text-gray-600">{metric.comparison}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 