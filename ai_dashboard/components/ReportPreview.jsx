import { Card, CardTitle } from "@/components/ui/card";
import { FileText, ChevronRight, Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/context/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

function ReportPreviewSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>

        <div className="grid gap-2">
          {[1, 2].map((index) => (
            <Card key={index} className="p-3">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
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
        <div className="p-4 text-center">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-medium text-foreground mb-1">No workspace selected</h3>
          <p className="text-sm text-muted-foreground">Select a workspace to view documents</p>
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
        <div className="p-4 text-center">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-medium text-foreground mb-1">No documents yet</h3>
          <p className="text-sm text-muted-foreground mb-3">Create your first document to get started</p>
          <Link href="/create-document">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              Create Report
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base">Recent Documents</h2>
            <Badge variant="secondary" className="text-xs">{recentReports.length}</Badge>
          </div>
          <Link 
            href="/documents" 
            className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
          >
            View all
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid gap-2">
          {recentReports.slice(0, 2).map((report) => (
            <Link key={report.id} href={`/documents/${report.id}`}>
              <Card className="p-3 hover:shadow-sm transition-all cursor-pointer group border-border hover:border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="font-medium text-sm text-foreground truncate">
                              {report.sub_type || report.document_type}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p>{report.sub_type || report.document_type}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="w-3 h-3" />
                        <span>{report.document_type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {report.content.substring(0, 30)}...
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {recentReports.length > 2 && (
            <Link href="/documents">
              <div className="text-center p-2 border border-dashed border-border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                <p className="text-xs text-muted-foreground group-hover:text-primary">
                  +{recentReports.length - 2} more documents
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
} 