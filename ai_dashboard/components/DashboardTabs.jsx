"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePreview } from "./FilePreview";
import { ReportPreview } from "./ReportPreview";
import { FileText, FileOutput } from "lucide-react";

export function DashboardTabs({ refresh }) {
  return (
    <Tabs defaultValue="files" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="files" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Files
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center gap-2">
          <FileOutput className="w-4 h-4" />
          Reports
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="files">
        <FilePreview refresh={refresh} />
      </TabsContent>
      
      <TabsContent value="reports">
        <ReportPreview />
      </TabsContent>
    </Tabs>
  );
} 