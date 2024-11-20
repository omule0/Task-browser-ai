"use client";
import { Card } from "@/components/ui/card";
import {
  Building2,
  BarChart2,
  Globe,
  Package,
  Users,
  Shield,
  Leaf,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import ReportActions from "@/components/report-actions";

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

export default function SellsideDueDiligence({ report }) {
  const sections = [
    { id: "executive-summary", title: "Executive Summary" },
    { id: "company-overview", title: "Company Overview" },
    { id: "financial-overview", title: "Financial Overview" },
    { id: "market-analysis", title: "Market Analysis" },
    { id: "product-portfolio", title: "Product Portfolio" },
    { id: "customer-analysis", title: "Customer Analysis" },
    { id: "operational-overview", title: "Operational Overview" },
    { id: "legal-regulatory", title: "Legal & Regulatory" },
    { id: "human-resources", title: "Human Resources" },
    { id: "esg", title: "ESG Practices" },
    { id: "risks", title: "Risk Assessment" },
    { id: "valuation", title: "Valuation Highlights" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ReportActions sections={sections} />
      
      {/* Report Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{report.title.content}</h1>
        <SourceTag source={report.title.sources[0]} />
      </div>

      {/* Executive Summary */}
      <Card id="executive-summary" className="p-6">
        <SectionHeader icon={<TrendingUp className="w-6 h-6 text-blue-600" />} title="Executive Summary" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Overview</h3>
            <p>{report.executiveSummary.overview}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Market Position</h3>
            <p>{report.executiveSummary.marketPosition}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Highlights</h3>
            <ul className="list-disc pl-5">
              {report.executiveSummary.keyHighlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.executiveSummary.source} />
        </div>
      </Card>

      {/* Company Overview */}
      <Card id="company-overview" className="p-6">
        <SectionHeader icon={<Building2 className="w-6 h-6 text-indigo-600" />} title="Company Overview" />
        <div className="space-y-4">
          {[
            { title: "History", content: report.companyOverview.history },
            { title: "Mission", content: report.companyOverview.mission },
            { title: "Structure", content: report.companyOverview.structure },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-medium mb-2">{section.title}</h3>
              <p>{section.content}</p>
            </div>
          ))}
          <SourceTag source={report.companyOverview.source} />
        </div>
      </Card>

      {/* Financial Overview */}
      <Card id="financial-overview" className="p-6">
        <SectionHeader icon={<BarChart2 className="w-6 h-6 text-green-600" />} title="Financial Overview" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Performance</h3>
            <p>{report.financialOverview.performance}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.financialOverview.metrics.map((metric, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metric.value}</div>
                  <div className="font-medium">{metric.metric}</div>
                  <p className="text-sm text-gray-600 mt-2">{metric.analysis}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Projections</h3>
            <p>{report.financialOverview.projections}</p>
          </div>
          <SourceTag source={report.financialOverview.source} />
        </div>
      </Card>

      {/* Market Analysis */}
      <Card id="market-analysis" className="p-6">
        <SectionHeader icon={<Globe className="w-6 h-6 text-purple-600" />} title="Market Analysis" />
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Industry Overview</h3>
            <p>{report.marketAnalysis.industryOverview}</p>
          </div>

          {/* Competitive Landscape */}
          <div>
            <h3 className="font-medium mb-2">Competitive Landscape</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.marketAnalysis.competitiveLandscape.map((competitor, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{competitor.competitor}</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-green-600">Strengths</h5>
                      <ul className="list-disc pl-5 text-sm">
                        {competitor.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-red-600">Weaknesses</h5>
                      <ul className="list-disc pl-5 text-sm">
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

          {/* SWOT Analysis */}
          <div>
            <h3 className="font-medium mb-2">SWOT Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Strengths", items: report.marketAnalysis.swotAnalysis.strengths, color: "text-green-600" },
                { title: "Weaknesses", items: report.marketAnalysis.swotAnalysis.weaknesses, color: "text-red-600" },
                { title: "Opportunities", items: report.marketAnalysis.swotAnalysis.opportunities, color: "text-blue-600" },
                { title: "Threats", items: report.marketAnalysis.swotAnalysis.threats, color: "text-orange-600" }
              ].map((section) => (
                <div key={section.title} className="border p-4 rounded-lg">
                  <h4 className={`font-medium mb-2 ${section.color}`}>{section.title}</h4>
                  <ul className="list-disc pl-5">
                    {section.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <SourceTag source={report.marketAnalysis.source} />
        </div>
      </Card>

      {/* Product Portfolio */}
      <Card id="product-portfolio" className="p-6">
        <SectionHeader icon={<Package className="w-6 h-6 text-orange-600" />} title="Product Portfolio" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.productPortfolio.products.map((product, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">{product.name}</h3>
                <p className="mb-2">{product.description}</p>
                <p className="text-sm text-gray-600">{product.performance}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">R&D Initiatives</h3>
            <ul className="list-disc pl-5">
              {report.productPortfolio.rdInitiatives.map((initiative, index) => (
                <li key={index}>{initiative}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.productPortfolio.source} />
        </div>
      </Card>

      {/* Customer Analysis */}
      <Card id="customer-analysis" className="p-6">
        <SectionHeader icon={<Users className="w-6 h-6 text-purple-600" />} title="Customer Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Market Segments</h3>
            <ul className="list-disc pl-5">
              {report.customerAnalysis.segments.map((segment, index) => (
                <li key={index}>{segment}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Customer Relationships</h3>
            <p>{report.customerAnalysis.relationships}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Pipeline</h3>
            <p>{report.customerAnalysis.pipeline}</p>
          </div>
          <SourceTag source={report.customerAnalysis.source} />
        </div>
      </Card>

      {/* Legal & Regulatory */}
      <Card id="legal-regulatory" className="p-6">
        <SectionHeader icon={<Shield className="w-6 h-6 text-blue-600" />} title="Legal & Regulatory" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Legal Structure</h3>
            <p>{report.legalRegulatory.structure}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Intellectual Property</h3>
            <ul className="list-disc pl-5">
              {report.legalRegulatory.intellectualProperty.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Compliance</h3>
            <ul className="list-disc pl-5">
              {report.legalRegulatory.compliance.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.legalRegulatory.source} />
        </div>
      </Card>

      {/* Human Resources */}
      <Card id="human-resources" className="p-6">
        <SectionHeader icon={<Users className="w-6 h-6 text-indigo-600" />} title="Human Resources" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Workforce Overview</h3>
            <p>{report.humanResources.workforce}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Leadership Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.humanResources.leadership.map((leader, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium">{leader.position}</h4>
                  <p className="text-sm text-gray-600">{leader.experience}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Company Culture</h3>
            <p>{report.humanResources.culture}</p>
          </div>
          <SourceTag source={report.humanResources.source} />
        </div>
      </Card>

      {/* ESG Practices */}
      <Card id="esg" className="p-6">
        <SectionHeader icon={<Leaf className="w-6 h-6 text-green-600" />} title="ESG Practices" />
        <div className="space-y-4">
          {[
            { title: "Environmental", items: report.esgPractices.environmental, icon: "🌱" },
            { title: "Social", items: report.esgPractices.social, icon: "👥" },
            { title: "Governance", items: report.esgPractices.governance, icon: "⚖️" }
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <span>{section.icon}</span> {section.title}
              </h3>
              <ul className="list-disc pl-5">
                {section.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <SourceTag source={report.esgPractices.source} />
        </div>
      </Card>

      {/* Risk Assessment */}
      <Card id="risks" className="p-6">
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

      {/* Valuation Highlights */}
      <Card id="valuation" className="p-6">
        <SectionHeader icon={<TrendingUp className="w-6 h-6 text-green-600" />} title="Valuation Highlights" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Value Drivers</h3>
            <ul className="list-disc pl-5">
              {report.valuationHighlights.valueDrivers.map((driver, index) => (
                <li key={index}>{driver}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Growth Opportunities</h3>
            <ul className="list-disc pl-5">
              {report.valuationHighlights.opportunities.map((opportunity, index) => (
                <li key={index}>{opportunity}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Potential Synergies</h3>
            <ul className="list-disc pl-5">
              {report.valuationHighlights.synergies.map((synergy, index) => (
                <li key={index}>{synergy}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.valuationHighlights.source} />
        </div>
      </Card>
    </div>
  );
} 