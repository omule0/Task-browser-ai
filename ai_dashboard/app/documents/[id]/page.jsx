"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useParams } from "next/navigation";
import ReportViewer from "./components/ReportViewer";
import GenerateReportViewer from "../../generate-report/components/ReportViewer";
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

  // Use GenerateReportViewer for custom reports, otherwise use the regular ReportViewer
  const isCustomReport = report.sub_type === "custom_report";

  return (
    <div className="min-h-screen bg-background">
      {isCustomReport ? (
        <GenerateReportViewer 
          report={report.report_data} 
          onBack={() => router.push('/documents')}
          title={report.content} // Using content field as title for custom reports
          createdAt={report.created_at}
        />
      ) : (
        <ReportViewer 
          report={report.report_data} 
          reportMetadata={report}
          onBack={() => router.push('/documents')}
          title={report.title}
          createdAt={report.created_at}
        />
      )}
    </div>
  );
}