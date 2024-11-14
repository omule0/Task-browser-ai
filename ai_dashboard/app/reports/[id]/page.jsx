"use client";
import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const renderReportSection = (data, level = 0) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-6 space-y-2">
        {data.map((item, index) => (
          <li key={index} className="text-gray-700">
            {typeof item === 'object' ? (
              <div>
                {item.finding && <div className="font-medium">{item.finding}</div>}
                {item.evidence && (
                  <ul className="list-circle pl-6 mt-2">
                    {item.evidence.map((evidence, i) => (
                      <li key={i} className="text-gray-600">{evidence}</li>
                    ))}
                  </ul>
                )}
                {item.source && (
                  <div className="text-sm text-gray-500 mt-1">
                    Source: {item.source.chunkIndex} - {item.source.preview}
                  </div>
                )}
              </div>
            ) : (
              <span>{item}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object') {
    return (
      <div className={`space-y-4 ${level > 0 ? 'mt-4' : ''}`}>
        {Object.entries(data).map(([key, value]) => {
          if (key === 'source') {
            return (
              <div key={key} className="text-sm text-gray-500">
                Source: {value.chunkIndex} - {value.preview}
              </div>
            );
          }
          
          // Handle content with sources structure
          if (key === 'content' && data.sources) {
            return (
              <div key={key}>
                <p className="text-gray-700">{value}</p>
                <div className="text-sm text-gray-500 mt-1">
                  Sources:
                  {data.sources.map((source, i) => (
                    <div key={i}>{source.chunkIndex} - {source.preview}</div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={key}>
              <h3 className={`font-medium capitalize mb-2 ${level === 0 ? 'text-xl' : 'text-lg'}`}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              {renderReportSection(value, level + 1)}
            </div>
          );
        })}
      </div>
    );
  }

  return <p className="text-gray-700">{data}</p>;
};

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
          {renderReportSection(report.report_data)}
        </div>
      </div>
    </div>
  );
} 