"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/context/workspace-context";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { customToast } from "@/components/ui/toast-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Copy, Check } from "lucide-react";

export default function GenerateReportPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [copied, setCopied] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const templates = [
    {
      id: "executive-summary",
      name: "Executive Summary",
      description: "A concise overview of key points and recommendations",
    },
    {
      id: "detailed-analysis",
      name: "Detailed Analysis",
      description: "In-depth analysis with comprehensive insights",
    },
  ];

  useEffect(() => {
    if (currentWorkspace) {
      loadFiles();
    }
  }, [currentWorkspace]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Only fetch files that have parsed content
      const { data: filesData, error } = await supabase
        .from('document_content')
        .select(`
          file_path,
          content,
          created_at
        `)
        .eq('workspace_id', currentWorkspace.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Process file paths to get original names
      const processedFiles = filesData.map(file => {
        const pathParts = file.file_path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const parts = fileName.split('-');
        const originalName = parts.slice(2).join('-');
        
        return {
          ...file,
          originalName,
          fileName
        };
      });

      setFiles(processedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      customToast.error('Error loading files');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      customToast.error('Failed to copy to clipboard');
    }
  };

  const handleGenerateReport = async () => {
    try {
      if (!selectedTemplate || selectedFiles.length === 0) {
        customToast.error('Please select a template and at least one file');
        return;
      }

      setGenerating(true);
      setGeneratedReport(null);

      const selectedContents = files
        .filter(file => selectedFiles.includes(file.file_path))
        .map(file => file.content);

      const response = await fetch('/api/generate-report-groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate,
          contents: selectedContents,
          workspaceId: currentWorkspace.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const reportText = await response.text();
      setGeneratedReport(reportText);
      customToast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      customToast.error('Error generating report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Generate Report</h1>
        <p className="text-gray-500">
          Select a template and files to generate a custom report
        </p>
      </div>

      <div className="grid gap-6 mb-6">
        {/* Template Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Select Template</h2>
          <Select
            value={selectedTemplate}
            onValueChange={setSelectedTemplate}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-500">
                      {template.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Select Files</h2>
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.file_path}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.file_path)}
                  onChange={(e) => {
                    setSelectedFiles(prev =>
                      e.target.checked
                        ? [...prev, file.file_path]
                        : prev.filter(f => f !== file.file_path)
                    );
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">{file.originalName}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {files.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No files with parsed content available
              </div>
            )}
          </div>
        </div>

        {/* Generate Report Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={generating || !selectedTemplate || selectedFiles.length === 0}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            'Generate Report'
          )}
        </Button>

        {/* Generated Report Display */}
        {generatedReport && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Generated Report</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                {generatedReport}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 