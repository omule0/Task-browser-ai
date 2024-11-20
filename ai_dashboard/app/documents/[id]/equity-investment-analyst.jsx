"use client";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Building2, 
  BarChart3, 
  Globe, 
  Target, 
  AlertTriangle, 
  LineChart,
  Users,
  Scale,
  Lightbulb,
  FileText
} from "lucide-react";
import ReportActions from "@/components/report-actions";

export default function EquityInvestmentAnalyst({ report }) {
  const sections = [
    { id: "executive-summary", title: "Executive Summary" },
    { id: "company-overview", title: "Company Overview" },
    { id: "industry-analysis", title: "Industry Analysis" },
    { id: "financial-analysis", title: "Financial Analysis" },
    { id: "valuation-analysis", title: "Valuation Analysis" },
    { id: "business-strategy", title: "Business Strategy" },
    { id: "risk-assessment", title: "Risk Assessment" },
    { id: "competitive-analysis", title: "Competitive Analysis" },
    { id: "esg-analysis", title: "ESG Analysis" },
    { id: "investment-considerations", title: "Investment Considerations" },
    { id: "appendix", title: "Appendix" }
  ];

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
    <div className="max-w-6xl mx-auto px-6 space-y-6">
      <ReportActions sections={sections} />

      {/* Executive Summary */}
      <Card id="executive-summary" className="p-6">
        <SectionHeader icon={<BookOpen className="w-6 h-6 text-blue-600" />} title="Executive Summary" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Overview</h3>
            <p>{report.executiveSummary.overview}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Investment Thesis</h3>
            <p>{report.executiveSummary.investmentThesis}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Points</h3>
            <ul className="list-disc pl-5">
              {report.executiveSummary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Recommendation</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Type:</span> {report.executiveSummary.recommendation.type.toUpperCase()}</p>
              <p><span className="font-medium">Rationale:</span> {report.executiveSummary.recommendation.rationale}</p>
              <p><span className="font-medium">Target Price:</span> {report.executiveSummary.recommendation.targetPrice}</p>
            </div>
          </div>
          <SourceTag source={report.executiveSummary.source} />
        </div>
      </Card>

      {/* Additional sections would follow similar pattern... */}
      
      {/* Company Overview */}
      <Card id="company-overview" className="p-6">
        <SectionHeader icon={<Building2 className="w-6 h-6 text-gray-600" />} title="Company Overview" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Business Model</h3>
            <p>{report.companyOverview.businessModel}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">History</h3>
            <p>{report.companyOverview.history}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Products & Services</h3>
            <ul className="list-disc pl-5">
              {report.companyOverview.products.map((product, index) => (
                <li key={index}>{product}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Geographic Presence</h3>
            <p>{report.companyOverview.geographicPresence}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Competitive Advantages</h3>
            <ul className="list-disc pl-5">
              {report.companyOverview.competitiveAdvantages.map((advantage, index) => (
                <li key={index}>{advantage}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.companyOverview.source} />
        </div>
      </Card>

      {/* Industry Analysis */}
      <Card id="industry-analysis" className="p-6">
        <SectionHeader icon={<Globe className="w-6 h-6 text-green-600" />} title="Industry Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Market Size</h3>
            <p>{report.industryAnalysis.marketSize}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Industry Trends</h3>
            <ul className="list-disc pl-5">
              {report.industryAnalysis.trends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Growth Drivers</h3>
            <ul className="list-disc pl-5">
              {report.industryAnalysis.growthDrivers.map((driver, index) => (
                <li key={index}>{driver}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">SWOT Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-3 rounded-lg bg-green-50">
                <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                <ul className="list-disc pl-5">
                  {report.industryAnalysis.swotAnalysis.strengths.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border p-3 rounded-lg bg-red-50">
                <h4 className="font-medium text-red-700 mb-2">Weaknesses</h4>
                <ul className="list-disc pl-5">
                  {report.industryAnalysis.swotAnalysis.weaknesses.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border p-3 rounded-lg bg-blue-50">
                <h4 className="font-medium text-blue-700 mb-2">Opportunities</h4>
                <ul className="list-disc pl-5">
                  {report.industryAnalysis.swotAnalysis.opportunities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="border p-3 rounded-lg bg-yellow-50">
                <h4 className="font-medium text-yellow-700 mb-2">Threats</h4>
                <ul className="list-disc pl-5">
                  {report.industryAnalysis.swotAnalysis.threats.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <SourceTag source={report.industryAnalysis.source} />
        </div>
      </Card>

      {/* Financial Analysis */}
      <Card id="financial-analysis" className="p-6">
        <SectionHeader icon={<BarChart3 className="w-6 h-6 text-purple-600" />} title="Financial Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Performance Overview</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Revenue:</span> {report.financialAnalysis.performance.revenue}</p>
              <p><span className="font-medium">Profitability:</span> {report.financialAnalysis.performance.profitability}</p>
              <p><span className="font-medium">Cash Flow:</span> {report.financialAnalysis.performance.cashFlow}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Financial Ratios</h3>
            {report.financialAnalysis.ratios.map((ratio, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-sm font-medium mb-2">{ratio.category}</h4>
                {ratio.metrics.map((metric, idx) => (
                  <div key={idx} className="ml-4 mb-2">
                    <p className="font-medium">{metric.name}: {metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.analysis}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">Financial Trends</h3>
            <ul className="list-disc pl-5">
              {report.financialAnalysis.trends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.financialAnalysis.source} />
        </div>
      </Card>

      {/* Valuation Analysis */}
      <Card id="valuation-analysis" className="p-6">
        <SectionHeader icon={<LineChart className="w-6 h-6 text-indigo-600" />} title="Valuation Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Valuation Methodologies</h3>
            {report.valuationAnalysis.methodologies.map((method, index) => (
              <div key={index} className="mb-4 border-b pb-4">
                <h4 className="font-medium">{method.type}</h4>
                <p className="mb-2">Value: {method.value}</p>
                <div>
                  <h5 className="text-sm font-medium">Assumptions:</h5>
                  <ul className="list-disc pl-5">
                    {method.assumptions.map((assumption, idx) => (
                      <li key={idx}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">Peer Comparison</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Company</th>
                    <th className="px-4 py-2 text-left">Metrics</th>
                  </tr>
                </thead>
                <tbody>
                  {report.valuationAnalysis.peerComparison.map((peer, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{peer.company}</td>
                      <td className="px-4 py-2">
                        {peer.metrics.map((metric, idx) => (
                          <div key={idx}>
                            {metric.name}: {metric.value}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <SourceTag source={report.valuationAnalysis.source} />
        </div>
      </Card>

      {/* Business Strategy */}
      <Card id="business-strategy" className="p-6">
        <SectionHeader icon={<Target className="w-6 h-6 text-blue-600" />} title="Business Strategy" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Business Model</h3>
            <p>{report.businessStrategy.model}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Strategic Initiatives</h3>
            <ul className="list-disc pl-5">
              {report.businessStrategy.initiatives.map((initiative, index) => (
                <li key={index}>{initiative}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Management Assessment</h3>
            <p>{report.businessStrategy.management}</p>
          </div>
          <SourceTag source={report.businessStrategy.source} />
        </div>
      </Card>

      {/* Risk Assessment */}
      <Card id="risk-assessment" className="p-6">
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

      {/* Competitive Analysis */}
      <Card id="competitive-analysis" className="p-6">
        <SectionHeader icon={<Users className="w-6 h-6 text-orange-600" />} title="Competitive Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Market Share</h3>
            <p>{report.competitiveAnalysis.marketShare}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Competitor Analysis</h3>
            {report.competitiveAnalysis.competitors.map((competitor, index) => (
              <div key={index} className="border p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">{competitor.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-green-600">Strengths</h5>
                    <ul className="list-disc pl-5">
                      {competitor.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-red-600">Weaknesses</h5>
                    <ul className="list-disc pl-5">
                      {competitor.weaknesses.map((weakness, idx) => (
                        <li key={idx}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <SourceTag source={competitor.source} />
              </div>
            ))}
          </div>
          <SourceTag source={report.competitiveAnalysis.source} />
        </div>
      </Card>

      {/* ESG Analysis */}
      <Card id="esg-analysis" className="p-6">
        <SectionHeader icon={<Scale className="w-6 h-6 text-green-600" />} title="ESG Analysis" />
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="font-medium mb-2">ESG Rating: {report.esgAnalysis.rating}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium mb-2">Environmental</h3>
              <ul className="list-disc pl-5">
                {report.esgAnalysis.environmental.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Social</h3>
              <ul className="list-disc pl-5">
                {report.esgAnalysis.social.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Governance</h3>
              <ul className="list-disc pl-5">
                {report.esgAnalysis.governance.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <SourceTag source={report.esgAnalysis.source} />
        </div>
      </Card>

      {/* Investment Considerations */}
      <Card id="investment-considerations" className="p-6">
        <SectionHeader icon={<Lightbulb className="w-6 h-6 text-yellow-600" />} title="Investment Considerations" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Risks</h3>
            <ul className="list-disc pl-5">
              {report.investmentConsiderations.risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Opportunities</h3>
            <ul className="list-disc pl-5">
              {report.investmentConsiderations.opportunities.map((opportunity, index) => (
                <li key={index}>{opportunity}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Catalysts</h3>
            <ul className="list-disc pl-5">
              {report.investmentConsiderations.catalysts.map((catalyst, index) => (
                <li key={index}>{catalyst}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.investmentConsiderations.source} />
        </div>
      </Card>

      {/* Appendix */}
      <Card id="appendix" className="p-6">
        <SectionHeader icon={<FileText className="w-6 h-6 text-gray-600" />} title="Appendix" />
        <div className="space-y-4">
          {report.appendix.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="mb-2">{item.content}</p>
              <p className="text-sm text-gray-600">Type: {item.type}</p>
              <SourceTag source={item.source} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 