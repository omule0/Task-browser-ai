"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useParams } from "next/navigation";
import ReportViewer from "./ReportViewer";
import { useRouter } from "next/navigation";

export default function DocumentView() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadReport();
    }
  }, [params.id]);

  const loadReport = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!report) return <div className="text-foreground">Report not found</div>;

  return (
    <div className="min-h-screen bg-background p-6">
      <ReportViewer 
        report={report.report_data} 
        onBack={() => router.push('/documents')}
      />
    </div>
  );
}