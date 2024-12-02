"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit3, MessageCircle, Plus } from "lucide-react";

const JsonRenderer = ({ data, level = 0 }) => {
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || data === null) {
    return <span className="text-gray-800">{String(data)}</span>;
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

  if (typeof data === 'object') {
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
  }

  return null;
};

export default function ReportViewer({ report, onBack }) {
  return (
    <div className="w-full">
      {/* Top Navigation */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Generated Report</h1>
            <p className="text-sm text-muted-foreground">
              View and share your generated report
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Share Report
          </Button>
        </div>
      </header>

      <Separator className="my-4" />

      {/* Main Content Area */}
      <div className="flex relative">
        {/* Document Content */}
        <main className="flex-1 bg-white">
          <JsonRenderer data={report} />
        </main>

        {/* Floating Button Group */}
        <div className="fixed right-4 top-1/4 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-lg bg-white"
          >
            <Edit3 className="w-4 h-4 text-emerald-500" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-lg bg-white"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-lg bg-white"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
          </Button>
        </div>
      </div>
    </div>
  );
} 