"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePreview } from "./FilePreview";
import { ReportPreview } from "./ReportPreview";
import { FileText, FileOutput, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/context/workspace-context";

export function DashboardTabs({ refresh }) {
  const [filesCount, setFilesCount] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("files");
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadCounts();
    }
  }, [currentWorkspace, refresh]);

  const loadCounts = async () => {
    const supabase = createClient();

    // Get files count
    const { count: filesCount } = await supabase
      .from('document_content')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', currentWorkspace.id);

    // Get documents count
    const { count: documentsCount } = await supabase
      .from('generated_reports')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', currentWorkspace.id);

    setFilesCount(filesCount || 0);
    setDocumentsCount(documentsCount || 0);
  };

  const tabInfo = {
    files: {
      title: "Files",
      description: "View and manage your uploaded files",
      icon: <FileText className="w-4 h-4 flex-shrink-0" />,
      count: filesCount
    },
    documents: {
      title: "Documents",
      description: "Access your AI-generated documents",
      icon: <FileOutput className="w-4 h-4 flex-shrink-0" />,
      count: documentsCount
    }
  };

  return (
    <Tabs 
      defaultValue="files" 
      className="w-full space-y-6"
      onValueChange={setActiveTab}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {tabInfo[activeTab].title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tabInfo[activeTab].description}
          </p>
        </div>

        <TabsList className="grid w-full sm:w-auto grid-cols-2 gap-2 p-1 h-auto bg-muted/50">
          {Object.entries(tabInfo).map(([key, { title, icon, count }]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="relative flex items-center justify-center gap-2 px-4 py-2.5 data-[state=active]:bg-background"
            >
              {icon}
              <span className="text-sm font-medium">{title}</span>
              {count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="ml-1 bg-primary/10 text-primary"
                  >
                    {count}
                  </Badge>
                </motion.div>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      <div className="mt-4 sm:mt-6">
        <TabsContent value="files" className="m-0 outline-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FilePreview refresh={refresh} />
          </motion.div>
        </TabsContent>
        
        <TabsContent value="documents" className="m-0 outline-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReportPreview />
          </motion.div>
        </TabsContent>
      </div>
    </Tabs>
  );
} 