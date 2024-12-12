"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { REPORT_SCHEMA_ORDER } from "../constants/reportSchemaOrder";
import { ReportDetailsSidebar } from "./ReportDetailsSidebar";
import ReportActions from "@/components/report-actions";

// Helper function to detect report type
const detectReportType = (reportData) => {

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
    return <span className="text-foreground">{String(data)}</span>;
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
  const reportType = detectReportType(report);
  
  // Create sections array for the report actions
  const sections = Object.keys(report).map(key => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }));
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Fixed header */}
        <header className="flex items-center justify-between px-6 h-[60px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{title || "Generated Report"}</h1>
              {createdAt && (
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Add ReportActions here */}
          <ReportActions sections={sections} title={title} />
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 printable-report">
            <JsonRenderer 
              data={report} 
              reportType={reportType} 
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <ReportDetailsSidebar report={reportMetadata} />
    </div>
  );
} 