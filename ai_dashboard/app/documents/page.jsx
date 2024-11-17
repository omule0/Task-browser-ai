"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/context/workspace-context";
import { customToast } from "@/components/ui/toast-theme";

export default function GeneratedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    loadReports();
  }, [currentWorkspace]);

  const loadReports = async () => {
    try {
      const supabase = createClient();

      let query = supabase
        .from('generated_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (currentWorkspace) {
        query = query.eq('workspace_id', currentWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, reportId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('generated_reports')
        .delete()
        .match({ 
          id: reportId,
          user_id: (await supabase.auth.getUser()).data.user.id 
        });

      if (error) {
        throw error;
      }
      
      customToast.success('Report deleted successfully');
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      customToast.error(error.message || 'Failed to delete report');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Generated Documents</h1>
        <Link href="/create-document" className="w-full sm:w-auto">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
            Generate New Document
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
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
                      <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600"
                      onClick={(e) => handleDelete(e, report.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              No reports generated yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              Start by generating your first report
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 