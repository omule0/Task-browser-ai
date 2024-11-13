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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Generated Reports</h1>
        <Link href="/create-document">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Generate New Report
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {report.sub_type || report.document_type}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {report.content.substring(0, 100)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </div>
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
            </Card>
          </Link>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reports generated yet
            </h3>
            <p className="text-gray-500">
              Start by generating your first report
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 