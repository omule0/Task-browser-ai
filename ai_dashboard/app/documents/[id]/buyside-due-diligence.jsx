"use client";
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Building2, Users, LineChart, Shield, Lightbulb } from "lucide-react";

export default function BuysideDueDiligence({ report }) {
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Report Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{report.title.content}</h1>
        <SourceTag source={report.title.sources[0]} />
      </div>

      {/* Executive Summary */}
      <Card className="p-6">
        <SectionHeader icon={<TrendingUp className="w-6 h-6 text-blue-600" />} title="Executive Summary" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Overview</h3>
            <p>{report.executiveSummary.overview}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Recommendation</h3>
            <p>{report.executiveSummary.recommendation}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Risks</h3>
            <ul className="list-disc pl-5">
              {report.executiveSummary.keyRisks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.executiveSummary.source} />
        </div>
      </Card>

      {/* Market Analysis */}
      <Card className="p-6">
        <SectionHeader icon={<LineChart className="w-6 h-6 text-green-600" />} title="Market Analysis" />
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Industry Overview</h3>
            <p>{report.marketAnalysis.industryOverview}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">SWOT Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Strengths", items: report.marketAnalysis.swotAnalysis.strengths, color: "bg-green-50" },
                { title: "Weaknesses", items: report.marketAnalysis.swotAnalysis.weaknesses, color: "bg-red-50" },
                { title: "Opportunities", items: report.marketAnalysis.swotAnalysis.opportunities, color: "bg-blue-50" },
                { title: "Threats", items: report.marketAnalysis.swotAnalysis.threats, color: "bg-yellow-50" }
              ].map((section) => (
                <div key={section.title} className={`p-4 rounded-lg ${section.color}`}>
                  <h4 className="font-medium mb-2">{section.title}</h4>
                  <ul className="list-disc pl-5">
                    {section.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Competitive Landscape</h3>
            <div className="space-y-4">
              {report.marketAnalysis.competitiveLandscape.map((competitor, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{competitor.competitor}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-green-600 mb-1">Strengths</h5>
                      <ul className="list-disc pl-5">
                        {competitor.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-red-600 mb-1">Weaknesses</h5>
                      <ul className="list-disc pl-5">
                        {competitor.weaknesses.map((weakness, idx) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Risk Assessment */}
      <Card className="p-6">
        <SectionHeader icon={<AlertTriangle className="w-6 h-6 text-red-600" />} title="Risk Assessment" />
        <div className="space-y-4">
          {report.riskAssessment.map((risk, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-medium mb-2">{risk.category}</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Risks:</h4>
                  <ul className="list-disc pl-5">
                    {risk.risks.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Mitigation:</h4>
                  <p>{risk.mitigation}</p>
                </div>
              </div>
              <SourceTag source={risk.source} />
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <SectionHeader icon={<Lightbulb className="w-6 h-6 text-yellow-600" />} title="Recommendations" />
        <div className="space-y-4">
          {[
            { title: "Deal Considerations", items: report.recommendations.dealConsiderations },
            { title: "Next Steps", items: report.recommendations.nextSteps },
            { title: "Value Creation Opportunities", items: report.recommendations.valueCreation }
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-medium mb-2">{section.title}</h3>
              <ul className="list-disc pl-5">
                {section.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <SourceTag source={report.recommendations.source} />
        </div>
      </Card>
    </div>
  );
} 