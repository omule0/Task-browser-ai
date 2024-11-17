"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePreview } from "./FilePreview";
import { ReportPreview } from "./ReportPreview";
import { FileText, FileOutput } from "lucide-react";

export function DashboardTabs({ refresh }) {
  return (
    <Tabs defaultValue="files" className="w-full space-y-4">
      <TabsList className="grid w-full grid-cols-2 gap-2 p-0">
        <TabsTrigger 
          value="files" 
          className="flex items-center justify-center gap-2 px-2 py-2 sm:px-4"
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm whitespace-nowrap">Files</span>
        </TabsTrigger>
        <TabsTrigger 
          value="documents" 
          className="flex items-center justify-center gap-2 px-2 py-2 sm:px-4"
        >
          <FileOutput className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm whitespace-nowrap">Documents</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-4 sm:mt-6">
        <TabsContent value="files" className="m-0">
          <FilePreview refresh={refresh} />
        </TabsContent>
        
        <TabsContent value="documents" className="m-0">
          <ReportPreview />
        </TabsContent>
      </div>
    </Tabs>
  );
} 