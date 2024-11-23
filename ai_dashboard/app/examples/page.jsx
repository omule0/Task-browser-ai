"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const exampleReports = {
  "business-plan": {
    title: "Business Plan Analysis",
    description: "AI-generated analysis of a sample business plan",
    content: [
      {
        section: "Executive Summary",
        content: "This AI analysis examines a business plan for a tech startup focusing on sustainable energy solutions. The plan demonstrates strong market potential with some areas requiring additional detail.",
        insights: [
          "Clear value proposition in renewable energy sector",
          "Detailed financial projections showing 40% YoY growth",
          "Well-defined target market segments"
        ]
      },
      {
        section: "Market Analysis",
        content: "The market analysis shows significant growth potential in the sustainable energy sector, with a projected market size of $500B by 2025.",
        insights: [
          "Growing market demand for sustainable solutions",
          "Competitive landscape analysis identifies key differentiators",
          "Clear market entry strategy"
        ]
      },
      {
        section: "Financial Projections",
        content: "Financial forecasts indicate strong potential for profitability within 24 months, with detailed cash flow analysis and funding requirements.",
        insights: [
          "Break-even analysis shows 18-month timeline",
          "Conservative revenue projections based on market data",
          "Clear capital requirements and allocation"
        ]
      }
    ]
  },
  "market-research": {
    title: "Market Research Summary",
    description: "AI analysis of market trends and opportunities",
    content: [
      {
        section: "Industry Overview",
        content: "Analysis of current market conditions, trends, and growth projections in the target industry.",
        insights: [
          "Market size growing at 15% CAGR",
          "Emerging opportunities in digital transformation",
          "Shift in consumer behavior patterns"
        ]
      },
      // Add more sections as needed
    ]
  },
  "financial-report": {
    title: "Financial Report Overview",
    description: "AI-powered financial analysis and metrics",
    content: [
      {
        section: "Financial Performance",
        content: "Comprehensive analysis of key financial metrics and performance indicators.",
        insights: [
          "Strong revenue growth trajectory",
          "Improving profit margins",
          "Healthy cash flow position"
        ]
      },
      // Add more sections as needed
    ]
  }
};

export default function ExamplesPage() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState("business-plan");

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
                  {exampleReports[selectedReport].title}
                </h2>
                <p className="text-gray-600">
                  {exampleReports[selectedReport].description}
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
              {exampleReports[selectedReport].content.map((section, index) => (
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