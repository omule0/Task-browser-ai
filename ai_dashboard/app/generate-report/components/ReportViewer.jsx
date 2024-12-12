"use client";
import ReportActions from "@/components/report-actions";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const JsonRenderer = ({ data, level = 0 }) => {
  if (typeof data !== 'object' || data === null) {
    return <span className="text-foreground">{String(data)}</span>;
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-6 mb-2">
        {data.map((item, index) => (
          <li key={index} className="mb-1">
            <JsonRenderer data={item} level={level + 1} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={`${level > 0 ? 'ml-4' : ''}`}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-2">
          <h3 className={`font-semibold ${level === 0 ? 'text-2xl mb-2' : level === 1 ? 'text-xl mb-1' : 'text-lg'}`}>
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
          </h3>
          <JsonRenderer data={value} level={level + 1} />
        </div>
      ))}
    </div>
  );
};

export default function ReportViewer({ report, onBack, title, createdAt }) {
  const sections = Object.keys(report).map(key => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header */}
      <header className="flex-none flex items-center justify-between px-6 h-[60px] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        <ReportActions sections={sections} title={title} />
      </header>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 printable-report">
          <JsonRenderer data={report} />
        </div>
      </ScrollArea>
    </div>
  );
} 