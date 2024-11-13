"use client";
import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReportDetail({ params }) {
  const resolvedParams = use(params);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadReport();
  }, [resolvedParams.id]);

  const loadReport = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
      router.push('/reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!report) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/reports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">
          {report.sub_type || report.document_type}
        </h1>
        <p className="text-gray-500 mt-2">
          Generated on {new Date(report.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="prose max-w-none">
          {/* Render json report data */}
          {JSON.stringify(report.report_data)}
        </div>
      </div>
    </div>
  );
} 