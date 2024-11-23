"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { exampleReports } from "./constants/examples";

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

  const currentReport = exampleReports[selectedReport];

  const handlePrint = () => {
    // Store current scroll position
    const scrollPos = window.scrollY;
    
    // Add print-specific class to body
    document.body.classList.add('printing');
    
    // Trigger print
    window.print();
    
    // Clean up after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('printing');
      window.scrollTo(0, scrollPos);
    }, 100);
  };

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
          <Card className="p-6 main-content">
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
                <Button 
                  size="sm" 
                  onClick={() => router.push('/create-document')}
                >
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