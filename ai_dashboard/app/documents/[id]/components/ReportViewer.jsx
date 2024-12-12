"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { REPORT_SCHEMA_ORDER } from "../constants/reportSchemaOrder";
import { ReportDetailsSidebar } from "./ReportDetailsSidebar";

// Helper function to detect report type
const detectReportType = (reportData) => {
  // Log the report data for debugging
  console.log('Report Data:', reportData);

  if (!reportData) return null;

  // Check if report_type exists directly
  if (reportData.report_type) return reportData.report_type;

  // Try to detect type based on unique sections
  if (reportData.methodology && reportData.results) return "Research report";
  if (reportData.businessOverview && reportData.operationalAssessment) return "Buyside Due Diligence";
  if (reportData.productPortfolio && reportData.valuationHighlights) return "Sellside Due Diligence";
  if (reportData.businessDescription && reportData.marketingStrategy) return "Business Plan";

  return null;
};

const JsonRenderer = ({ data, level = 0, reportType }) => {
  if (typeof data !== 'object' || data === null) {
    return <span className="text-gray-800">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-6 mb-2">
        {data.map((item, index) => (
          <li key={index} className="mb-1">
            <JsonRenderer data={item} level={level + 1} reportType={reportType} />
          </li>
        ))}
      </ul>
    );
  }

  // Get the schema order for the current report type
  const schemaOrder = REPORT_SCHEMA_ORDER[reportType] || [];
  
  // Sort entries based on schema order
  let entries = Object.entries(data);
  entries.sort(([keyA], [keyB]) => {
    const indexA = schemaOrder.indexOf(keyA);
    const indexB = schemaOrder.indexOf(keyB);
    
    // If both keys are in schema, sort by schema order
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only one key is in schema, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // For keys not in schema, maintain original order
    return 0;
  });

  return (
    <div className={`${level > 0 ? 'ml-4' : ''}`}>
      {entries.map(([key, value]) => (
        <div key={key} className="mb-2">
          <h3 className={`font-semibold ${level === 0 ? 'text-2xl mb-2' : level === 1 ? 'text-xl mb-1' : 'text-lg'}`}>
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
          </h3>
          <JsonRenderer data={value} level={level + 1} reportType={reportType} />
        </div>
      ))}
    </div>
  );
};

export default function ReportViewer({ report, reportMetadata, onBack, title, createdAt }) {
  // Detect report type from the data
  const reportType = detectReportType(report);
  
  return (
    <div className="w-full flex">
      <div className="flex-1">
        {/* Top Navigation */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{title || "Generated Report"}</h1>
              {createdAt && (
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </header>

        <Separator className="my-4" />

        <div className="flex relative">
          <main className="flex-1 bg-white p-6">
            <JsonRenderer 
              data={report} 
              reportType={reportType} 
            />
          </main>
        </div>
      </div>
      <ReportDetailsSidebar report={reportMetadata} />
    </div>
  );
} 