import { Card } from "@/components/ui/card";
import { FileText, ChevronRight, Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/context/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function ReportPreviewSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-5 w-28" />
        </div>

        <div className="grid gap-4">
          {[1, 2].map((index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <Skeleton className="w-5 h-5" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ReportPreview() {
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    loadRecentReports();
  }, [currentWorkspace]);

  const loadRecentReports = async () => {
    try {
      const supabase = createClient();

      let query = supabase
        .from('generated_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (currentWorkspace) {
        query = query.eq('workspace_id', currentWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setRecentReports(data || []);
    } catch (error) {
      console.error('Error loading recent reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <div className="p-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No workspace selected</h3>
          <p className="text-muted-foreground">Please select or create a workspace to view documents</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return <ReportPreviewSkeleton />;
  }

  if (recentReports.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
          <p className="text-muted-foreground mb-4">Create your first document to get started</p>
          <Link href="/create-document">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2">
              Create your first document
            </button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Badge variant="secondary">{recentReports.length}</Badge>
          </div>
          <Link 
            href="/documents" 
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
          >
            View all documents
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid gap-4">
          {recentReports.map((report) => (
            <Link key={report.id} href={`/documents/${report.id}`}>
              <Card className="p-4 hover:shadow-md transition-all cursor-pointer group border-gray-200 hover:border-purple-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="font-medium text-gray-900 truncate max-w-[300px]">
                              {report.sub_type || report.document_type}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{report.sub_type || report.document_type}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>{report.document_type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 sm:line-clamp-1 max-w-[600px]">
                        {report.content.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center ml-16 sm:ml-0">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
} 