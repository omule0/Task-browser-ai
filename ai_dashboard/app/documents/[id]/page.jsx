"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BuysideDueDiligence from "./buyside-due-diligence";
import ResearchReport from "./research-report";

export default function DocumentView() {
  const params = useParams();
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
  if (!report) return <div>Report not found</div>;

  const renderReport = () => {
    switch (report.sub_type) {
      case "Buyside Due Diligence":
        return <BuysideDueDiligence report={report.report_data} />;
      case "Research report":
        return <ResearchReport report={report.report_data} />;
      default:
        return <div className="max-w-6xl mx-auto px-6">This report type is not yet supported.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/documents">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{report.sub_type}</h1>
                <p className="text-sm text-gray-500">
                  Created on {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        {renderReport()}
      </div>
    </div>
  );
}