"use client";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftClose, FileText, Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
});

export function PdfSection({
  selectedFile,
  pdfUrl,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}) {
  return (
    <div className="w-[40%] flex flex-col">
      {/* PDF Header */}
      <div className="flex items-center px-3 py-2 border-b border-gray-200 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="mr-1 h-8 w-8"
        >
          {isSidebarCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </Button>
        <h2 className="text-base font-semibold flex-1">
          {selectedFile ? selectedFile.originalName : 'No file selected'}
        </h2>
      </div>

      {/* PDF Content */}
      <div className="flex-1 bg-gray-100 flex justify-center overflow-hidden">
        {!selectedFile ? (
          <div className="flex items-center justify-center w-full p-8">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No file selected</h3>
              <p className="text-sm text-gray-500">
                Select a PDF file from the sidebar to view it here
              </p>
            </div>
          </div>
        ) : !pdfUrl ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="w-full h-full relative">
            <PdfViewer url={pdfUrl} />
          </div>
        )}
      </div>
    </div>
  );
}