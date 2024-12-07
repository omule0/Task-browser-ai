"use client";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { exampleReports } from "./constants/examples";
import ReportViewer from "../generate-report/components/ReportViewer";

// Create a separate component for the content that uses useSearchParams
function ExampleContent() {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <Card className="p-3 lg:col-span-1 lg:sticky lg:top-4 h-fit overflow-hidden">
        <h2 className="font-semibold mb-2">Report Types</h2>
        <div className="space-y-1">
          {Object.entries(exampleReports).map(([key, report]) => (
            <Button
              key={key}
              variant={selectedReport === key ? "default" : "ghost"}
              className="w-full justify-start text-left whitespace-normal h-auto py-2"
              size="sm"
              onClick={() => setSelectedReport(key)}
            >
              <FileText className="w-4 h-4 mr-2 shrink-0" />
              <span className="line-clamp-2">{report.title}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Main Content */}
      <motion.div
        key={selectedReport}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-3"
      >
        <ReportViewer 
          report={currentReport.content}
          title={currentReport.title}
          onBack={() => router.back()}
        />
      </motion.div>
    </div>
  );
}

// Main page component
export default function ExamplesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        
        <h1 className="text-xl font-bold mb-1">Example AI Reports</h1>
        <p className="text-sm text-gray-600">
          See how our AI analyzes different types of business documents and generates insights.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ExampleContent />
      </Suspense>
    </div>
  );
} 
