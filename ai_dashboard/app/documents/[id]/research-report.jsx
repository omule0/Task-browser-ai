"use client";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  BarChart, 
  MessageCircle,
  Microscope,  // Changed from Flask
  Target
} from "lucide-react";

// First, let's define these as actual components
const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    {icon}
    <h2 className="text-xl font-semibold">{title}</h2>
  </div>
);

const SourceTag = ({ source }) => (
  <div className="text-xs text-gray-500 mt-2">
    {source.chunkIndex}: {source.preview}
  </div>
);

export default function ResearchReport({ report }) {
  if (!report) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Introduction */}
      <Card className="p-6">
        <SectionHeader icon={<BookOpen className="w-6 h-6 text-blue-600" />} title="Introduction" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Context</h3>
            <p>{report.introduction?.context}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Objectives</h3>
            <ul className="list-disc pl-5">
              {report.introduction?.objectives?.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Significance</h3>
            <p>{report.introduction?.significance}</p>
          </div>
          
          {report.introduction?.source && <SourceTag source={report.introduction.source} />}
        </div>
      </Card>

      {/* Methodology */}
      <Card className="p-6">
        <SectionHeader icon={<Microscope className="w-6 h-6 text-purple-600" />} title="Methodology" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Research Design</h3>
            <p>{report.methodology?.researchDesign}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Participants</h3>
            <p>{report.methodology?.participants}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Data Collection</h3>
            <p>{report.methodology?.dataCollection}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Analysis Method</h3>
            <p>{report.methodology?.analysisMethod}</p>
          </div>
          
          {report.methodology?.source && <SourceTag source={report.methodology.source} />}
        </div>
      </Card>

      {/* Results */}
      <Card className="p-6">
        <SectionHeader icon={<BarChart className="w-6 h-6 text-green-600" />} title="Results" />
        <div className="space-y-4">
          {report.results?.map((result, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-medium mb-2">Finding {index + 1}</h3>
              <p>{result.finding}</p>
              
              <h4 className="font-medium mt-3 mb-2">Supporting Evidence</h4>
              <ul className="list-disc pl-5">
                {result.evidence?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              
              {result.source && <SourceTag source={result.source} />}
            </div>
          ))}
        </div>
      </Card>

      {/* Discussion */}
      <Card className="p-6">
        <SectionHeader icon={<MessageCircle className="w-6 h-6 text-yellow-600" />} title="Discussion" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Interpretation</h3>
            <ul className="list-disc pl-5">
              {report.discussion?.interpretation?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Implications</h3>
            <ul className="list-disc pl-5">
              {report.discussion?.implications?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Limitations</h3>
            <ul className="list-disc pl-5">
              {report.discussion?.limitations?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Future Research</h3>
            <ul className="list-disc pl-5">
              {report.discussion?.futureResearch?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          
          {report.discussion?.source && <SourceTag source={report.discussion.source} />}
        </div>
      </Card>
    </div>
  );
} 