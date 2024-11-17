import { Card } from "@/components/ui/card";
import { FileText, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useWorkspace } from "@/context/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-28" />
          </div>

          <div className="grid gap-4">
            {[1, 2].map((index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (recentReports.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl font-semibold">Recent Documents</h2>
          <Link href="/documents" className="text-sm text-purple-600 hover:text-purple-700">
            View all documents
          </Link>
        </div>

        <div className="grid gap-4">
          {recentReports.map((report) => (
            <Link key={report.id} href={`/documents/${report.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">
                        {report.sub_type || report.document_type}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
                        {report.content.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
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