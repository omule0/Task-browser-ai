'use client';
import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SectionCard = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 rounded-t-lg"
      >
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <CardContent className="pt-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

const SourceReference = ({ source }) => {
  if (!source) return null;
  
  // Handle both single source and array of sources
  const sources = Array.isArray(source) ? source : [source];
  
  return (
    <>
      {sources.map((src, idx) => (
        <div key={idx} className="flex items-center gap-1 text-sm text-gray-500 mt-2 pl-4 border-l-2 border-gray-200">
          <ExternalLink className="w-4 h-4" />
          <span>
            {src.chunkIndex} - {src.preview}
          </span>
        </div>
      ))}
    </>
  );
};

const renderContent = (data) => {
  if (!data) return null;

  // Handle string content with sources
  if (typeof data === 'object' && data.content) {
    return (
      <div>
        <div className="text-gray-700 leading-relaxed">{data.content}</div>
        <SourceReference source={data.sources} />
      </div>
    );
  }
  
  // Handle plain string
  if (typeof data === 'string') {
    return <div className="text-gray-700 leading-relaxed">{data}</div>;
  }

  // Handle object with source
  if (typeof data === 'object' && data.source) {
    return (
      <div>
        <div className="text-gray-700 leading-relaxed">
          {Object.entries(data).map(([key, value]) => {
            if (key !== 'source' && typeof value === 'string') {
              return <div key={key}>{value}</div>;
            }
            return null;
          })}
        </div>
        <SourceReference source={data.source} />
      </div>
    );
  }

  return null;
};

const renderListItems = (items, type = "disc") => {
  if (!items) return null;

  return (
    <ul className={`list-${type} pl-6 space-y-3 mt-2`}>
      {items.map((item, idx) => (
        <li key={idx} className="text-gray-700">
          {typeof item === "object" ? (
            <div>
              {item.finding && (
                <div className="font-medium text-gray-900">{item.finding}</div>
              )}
              {item.evidence && (
                <ul className="list-circle pl-6 mt-2 space-y-2">
                  {item.evidence.map((evidence, i) => (
                    <li key={i} className="text-gray-600">{evidence}</li>
                  ))}
                </ul>
              )}
              {item.source && <SourceReference source={item.source} />}
            </div>
          ) : (
            <span>{item}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

const ResearchReport = ({ data }) => (
  <div className="space-y-6">
    <SectionCard title="Introduction">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Context</h3>
          {renderContent(data.introduction.context)}
          {data.introduction.source && <SourceReference source={data.introduction.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Objectives</h3>
          {renderListItems(data.introduction.objectives)}
          {data.introduction.source && <SourceReference source={data.introduction.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Significance</h3>
          {renderContent(data.introduction.significance)}
          {data.introduction.source && <SourceReference source={data.introduction.source} />}
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Methodology">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Research Design</h3>
          {renderContent(data.methodology.researchDesign)}
          {data.methodology.source && <SourceReference source={data.methodology.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Participants</h3>
          {renderContent(data.methodology.participants)}
          {data.methodology.source && <SourceReference source={data.methodology.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Data Collection</h3>
          {renderContent(data.methodology.dataCollection)}
          {data.methodology.source && <SourceReference source={data.methodology.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Analysis Method</h3>
          {renderContent(data.methodology.analysisMethod)}
          {data.methodology.source && <SourceReference source={data.methodology.source} />}
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Key Findings">
      {renderListItems(data.results)}
    </SectionCard>

    <SectionCard title="Discussion">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Interpretation</h3>
          {renderListItems(data.discussion.interpretation)}
          {data.discussion.source && <SourceReference source={data.discussion.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Implications</h3>
          {renderListItems(data.discussion.implications)}
          {data.discussion.source && <SourceReference source={data.discussion.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Limitations</h3>
          {renderListItems(data.discussion.limitations)}
          {data.discussion.source && <SourceReference source={data.discussion.source} />}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Future Research</h3>
          {renderListItems(data.discussion.futureResearch)}
          {data.discussion.source && <SourceReference source={data.discussion.source} />}
        </div>
      </div>
    </SectionCard>
  </div>
);

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Link href="/reports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {report.sub_type || report.document_type}
        </h1>
        <div className="flex items-center gap-2 mt-3 text-gray-500">
          <span>Generated on {new Date(report.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {report.report_data && <ResearchReport data={report.report_data} />}
    </div>
  );
}