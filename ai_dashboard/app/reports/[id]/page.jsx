'use client';
import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Menu,
  X,
  Download,
  Share2,
  Printer,
  Search,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TableOfContents = ({ sections, activeSection, onSectionClick }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        Table of Contents
      </h2>
      <nav>
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            <a
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSectionClick(section.id);
              }}
              className={`block py-2 px-3 rounded-md transition-colors ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "hover:bg-gray-50"
              }`}
            >
              {section.title}
            </a>
            {section.subsections && (
              <div className="ml-4 mt-2 border-l-2 border-gray-100">
                {section.subsections.map((subsection) => (
                  <a
                    key={subsection.id}
                    href={`#${subsection.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSectionClick(subsection.id);
                    }}
                    className={`block py-1 px-3 text-sm transition-colors ${
                      activeSection === subsection.id
                        ? "text-blue-600 font-medium"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {subsection.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

const ActionBar = ({ onPrint, onDownload, onShare, onSearch }) => (
  <div className="flex items-center gap-2 mb-6">
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={onPrint}
    >
      <Printer className="w-4 h-4" />
      Print
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={onDownload}
    >
      <Download className="w-4 h-4" />
      Download PDF
    </Button>
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      onClick={onShare}
    >
      <Share2 className="w-4 h-4" />
      Share
    </Button>
    <div className="flex-grow" />
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search in report..."
        className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  </div>
);

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

const ResearchReport = ({ data, activeSection }) => {
  return (
    <div className="space-y-6">
      <SectionCard title="Introduction" id="introduction" isActive={activeSection === "introduction"}>
        <div className="space-y-6">
          <div id="context">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Context</h3>
            {renderContent(data.introduction.context)}
            {data.introduction.source && <SourceReference source={data.introduction.source} />}
          </div>
          <div id="objectives">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Objectives</h3>
            {renderListItems(data.introduction.objectives)}
            {data.introduction.source && <SourceReference source={data.introduction.source} />}
          </div>
          <div id="significance">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Significance</h3>
            {renderContent(data.introduction.significance)}
            {data.introduction.source && <SourceReference source={data.introduction.source} />}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Methodology" id="methodology" isActive={activeSection === "methodology"}>
        <div className="space-y-6">
          <div id="research-design">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Research Design</h3>
            {renderContent(data.methodology.researchDesign)}
            {data.methodology.source && <SourceReference source={data.methodology.source} />}
          </div>
          <div id="participants">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Participants</h3>
            {renderContent(data.methodology.participants)}
            {data.methodology.source && <SourceReference source={data.methodology.source} />}
          </div>
          <div id="data-collection">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Data Collection</h3>
            {renderContent(data.methodology.dataCollection)}
            {data.methodology.source && <SourceReference source={data.methodology.source} />}
          </div>
          <div id="analysis-method">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Analysis Method</h3>
            {renderContent(data.methodology.analysisMethod)}
            {data.methodology.source && <SourceReference source={data.methodology.source} />}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Key Findings" id="findings" isActive={activeSection === "findings"}>
        {renderListItems(data.results)}
      </SectionCard>

      <SectionCard title="Discussion" id="discussion" isActive={activeSection === "discussion"}>
        <div className="space-y-6">
          <div id="interpretation">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Interpretation</h3>
            {renderListItems(data.discussion.interpretation)}
            {data.discussion.source && <SourceReference source={data.discussion.source} />}
          </div>
          <div id="implications">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Implications</h3>
            {renderListItems(data.discussion.implications)}
            {data.discussion.source && <SourceReference source={data.discussion.source} />}
          </div>
          <div id="limitations">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Limitations</h3>
            {renderListItems(data.discussion.limitations)}
            {data.discussion.source && <SourceReference source={data.discussion.source} />}
          </div>
          <div id="future-research">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Future Research</h3>
            {renderListItems(data.discussion.futureResearch)}
            {data.discussion.source && <SourceReference source={data.discussion.source} />}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default function ReportDetail({ params }) {
  const resolvedParams = use(params);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [showToc, setShowToc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      subsections: [
        { id: "context", title: "Context" },
        { id: "objectives", title: "Objectives" },
        { id: "significance", title: "Significance" }
      ]
    },
    {
      id: "methodology",
      title: "Methodology",
      subsections: [
        { id: "research-design", title: "Research Design" },
        { id: "participants", title: "Participants" },
        { id: "data-collection", title: "Data Collection" },
        { id: "analysis-method", title: "Analysis Method" }
      ]
    },
    {
      id: "findings",
      title: "Key Findings"
    },
    {
      id: "discussion",
      title: "Discussion",
      subsections: [
        { id: "interpretation", title: "Interpretation" },
        { id: "implications", title: "Implications" },
        { id: "limitations", title: "Limitations" },
        { id: "future-research", title: "Future Research" }
      ]
    }
  ];

  useEffect(() => {
    loadReport();
  }, [resolvedParams.id]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("[id]");
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleSectionClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download functionality
    console.log("Download PDF");
  };

  const handleShare = () => {
    // Implement share functionality
    console.log("Share report");
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Implement search highlighting
  };

  if (loading) return <Loading />;
  if (!report) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex gap-6">
        {/* Sidebar with Table of Contents */}
        <div className="w-64 hidden lg:block">
          <TableOfContents
            sections={sections}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          <div className="mb-8">
            <Link href="/reports">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>
            </Link>
            
            {/* Mobile ToC Toggle */}
            <Button
              variant="outline"
              className="lg:hidden mb-4 ml-2"
              onClick={() => setShowToc(!showToc)}
            >
              {showToc ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              {showToc ? "Hide Contents" : "Show Contents"}
            </Button>

            <h1 className="text-3xl font-bold text-gray-900">
              {report.sub_type || report.document_type}
            </h1>
            <div className="flex items-center gap-2 mt-3 text-gray-500">
              <span>Generated on {new Date(report.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Mobile ToC */}
          {showToc && (
            <div className="lg:hidden mb-6">
              <Card>
                <CardContent className="py-4">
                  <TableOfContents
                    sections={sections}
                    activeSection={activeSection}
                    onSectionClick={handleSectionClick}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          <ActionBar
            onPrint={handlePrint}
            onDownload={handleDownload}
            onShare={handleShare}
            onSearch={handleSearch}
          />

          {report.report_data && (
            <ResearchReport 
              data={report.report_data} 
              activeSection={activeSection}
            />
          )}
        </div>
      </div>
    </div>
  );
}