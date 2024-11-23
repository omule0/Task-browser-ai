"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const exampleReports = {
  "credit-investment-analysis": {
    title: "Credit Suisse Investment Analysis",
    description: "AI-generated credit and investment analysis report",
    content: [
      {
        section: "Executive Summary",
        content: "This report evaluates Credit Suisse's financial health, market position, and risk factors, providing a comprehensive analysis of its creditworthiness.",
        insights: [
          "OUTPERFORM rating with strong order book prospects",
          "Net profit of RM27.8 million in Q1 2023",
          "Key risks include policy changes and payment risks"
        ]
      },
      {
        section: "Credit Metrics",
        content: "The capital structure is primarily equity-based with minimal debt exposure, enhancing financial stability.",
        insights: [
          "Debt to Equity Ratio: 0.1 - Conservative leverage approach",
          "Interest Coverage Ratio: 10.5 - Strong debt service capability",
          "Favorable debt maturity profile"
        ]
      },
      {
        section: "Financial Analysis",
        content: "Financial performance shows mixed results with some challenges in the construction division.",
        insights: [
          "Net Profit Margin: 6.3% - Decreased due to construction segment",
          "ROE: 18.8% - Strong equity management",
          "Current Ratio: 1.5 - Healthy liquidity position"
        ]
      },
      {
        section: "Risk Assessment",
        content: "Comprehensive analysis of key risk factors and mitigation strategies.",
        insights: [
          "Market risks: Economic downturns and regulatory changes",
          "Operational risks: Project delays and cost overruns",
          "Strong risk mitigation through diversification"
        ]
      },
      {
        section: "ESG Analysis",
        content: "Environmental, Social, and Governance factors assessment.",
        insights: [
          "Environmental: Carbon footprint reduction initiatives",
          "Social: Strong community engagement",
          "Governance: Transparent reporting practices"
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
                <div key={index} className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {section.section}
                  </h3>
                  <p className="text-gray-600">
                    {section.content}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3">Key Insights</h4>
                    <ul className="space-y-2">
                      {section.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 