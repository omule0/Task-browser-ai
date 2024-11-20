"use client";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Building2, 
  BarChart3, 
  Globe, 
  Package, 
  Target, 
  Settings, 
  Users, 
  AlertTriangle, 
  Megaphone,
  FileText
} from "lucide-react";
import ReportActions from "@/components/report-actions";

export default function BusinessPlan({ report }) {
  const sections = [
    { id: "executive-summary", title: "Executive Summary" },
    { id: "business-description", title: "Business Description" },
    { id: "market-analysis", title: "Market Analysis" },
    { id: "products-services", title: "Products & Services" },
    { id: "marketing-strategy", title: "Marketing Strategy" },
    { id: "operations-plan", title: "Operations Plan" },
    { id: "management", title: "Management" },
    { id: "financial-plan", title: "Financial Plan" },
    { id: "risk-analysis", title: "Risk Analysis" },
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ReportActions sections={sections} />
      
      {/* Report Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{report.title.content}</h1>
        <SourceTag source={report.title.sources[0]} />
      </div>

      {/* Executive Summary */}
      <Card id="executive-summary" className="p-6">
        <SectionHeader icon={<BookOpen className="w-6 h-6 text-blue-600" />} title="Executive Summary" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Overview</h3>
            <p>{report.executiveSummary.overview}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Mission</h3>
            <p>{report.executiveSummary.mission}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Highlights</h3>
            <ul className="list-disc pl-5">
              {report.executiveSummary.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Objectives</h3>
            <ul className="list-disc pl-5">
              {report.executiveSummary.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.executiveSummary.source} />
        </div>
      </Card>

      {/* Business Description */}
      <Card id="business-description" className="p-6">
        <SectionHeader icon={<Building2 className="w-6 h-6 text-purple-600" />} title="Business Description" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Concept</h3>
            <p>{report.businessDescription.concept}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">History</h3>
            <p>{report.businessDescription.history}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Legal Structure</h3>
            <p>{report.businessDescription.legalStructure}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Values</h3>
            <ul className="list-disc pl-5">
              {report.businessDescription.values.map((value, index) => (
                <li key={index}>{value}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.businessDescription.source} />
        </div>
      </Card>

      {/* Market Analysis */}
      <Card id="market-analysis" className="p-6">
        <SectionHeader icon={<Globe className="w-6 h-6 text-green-600" />} title="Market Analysis" />
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Industry Overview</h3>
            <p>{report.marketAnalysis.industryOverview}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Target Market</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Demographics</h4>
                <ul className="list-disc pl-5">
                  {report.marketAnalysis.targetMarket.demographics.map((demo, index) => (
                    <li key={index}>{demo}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium">Needs</h4>
                <ul className="list-disc pl-5">
                  {report.marketAnalysis.targetMarket.needs.map((need, index) => (
                    <li key={index}>{need}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium">Market Size</h4>
                <p>{report.marketAnalysis.targetMarket.size}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Competitive Analysis</h3>
            <div className="space-y-4">
              {report.marketAnalysis.competitiveAnalysis.map((competitor, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{competitor.competitor}</h4>
                  <div className="grid grid-cols-2 gap-4">
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
                </div>
              ))}
            </div>
          </div>
          <SourceTag source={report.marketAnalysis.source} />
        </div>
      </Card>

      {/* Products & Services */}
      <Card id="products-services" className="p-6">
        <SectionHeader icon={<Package className="w-6 h-6 text-indigo-600" />} title="Products & Services" />
        <div className="space-y-6">
          <div className="space-y-4">
            {report.productsServices.offerings.map((offering, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">{offering.name}</h3>
                <p className="mb-2">{offering.description}</p>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium">Features</h4>
                    <ul className="list-disc pl-5">
                      {offering.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Pricing</h4>
                    <p>{offering.pricing}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="font-medium mb-2">R&D Plans</h3>
            <ul className="list-disc pl-5">
              {report.productsServices.rdPlans.map((plan, index) => (
                <li key={index}>{plan}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.productsServices.source} />
        </div>
      </Card>

      {/* Marketing Strategy */}
      <Card id="marketing-strategy" className="p-6">
        <SectionHeader icon={<Megaphone className="w-6 h-6 text-yellow-600" />} title="Marketing Strategy" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Channels</h3>
            <ul className="list-disc pl-5">
              {report.marketingStrategy.channels.map((channel, index) => (
                <li key={index}>{channel}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Tactics</h3>
            <ul className="list-disc pl-5">
              {report.marketingStrategy.tactics.map((tactic, index) => (
                <li key={index}>{tactic}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Pricing Strategy</h3>
            <p>{report.marketingStrategy.pricing}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Customer Retention</h3>
            <p>{report.marketingStrategy.retention}</p>
          </div>
          <SourceTag source={report.marketingStrategy.source} />
        </div>
      </Card>

      {/* Operations Plan */}
      <Card id="operations-plan" className="p-6">
        <SectionHeader icon={<Settings className="w-6 h-6 text-gray-600" />} title="Operations Plan" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Location</h3>
            <p>{report.operationsPlan.location}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Processes</h3>
            <p>{report.operationsPlan.processes}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Suppliers</h3>
            <ul className="list-disc pl-5">
              {report.operationsPlan.suppliers.map((supplier, index) => (
                <li key={index}>{supplier}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Technology</h3>
            <p>{report.operationsPlan.technology}</p>
          </div>
          <SourceTag source={report.operationsPlan.source} />
        </div>
      </Card>

      {/* Management */}
      <Card id="management" className="p-6">
        <SectionHeader icon={<Users className="w-6 h-6 text-orange-600" />} title="Management" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Organizational Structure</h3>
            <p>{report.management.structure}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Management Team</h3>
            <div className="space-y-4">
              {report.management.team.map((member, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{member.role}</h4>
                  <p className="mb-2">{member.qualifications}</p>
                  <div>
                    <h5 className="text-sm font-medium">Responsibilities</h5>
                    <ul className="list-disc pl-5">
                      {member.responsibilities.map((resp, idx) => (
                        <li key={idx}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <SourceTag source={report.management.source} />
        </div>
      </Card>

      {/* Financial Plan */}
      <Card id="financial-plan" className="p-6">
        <SectionHeader icon={<BarChart3 className="w-6 h-6 text-blue-600" />} title="Financial Plan" />
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Projections</h3>
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium">Revenue</h4>
                <p>{report.financialPlan.projections.revenue}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Expenses</h4>
                <p>{report.financialPlan.projections.expenses}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Profitability</h4>
                <p>{report.financialPlan.projections.profitability}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Key Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.financialPlan.metrics.map((metric, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="font-medium text-lg">{metric.value}</h4>
                  <p className="text-sm text-gray-600 mb-2">{metric.metric}</p>
                  <p className="text-sm">{metric.analysis}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Funding</h3>
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium">Requirements</h4>
                <p>{report.financialPlan.funding.requirements}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Use of Funds</h4>
                <ul className="list-disc pl-5">
                  {report.financialPlan.funding.use.map((use, index) => (
                    <li key={index}>{use}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium">Terms</h4>
                <p>{report.financialPlan.funding.terms}</p>
              </div>
            </div>
          </div>
          <SourceTag source={report.financialPlan.source} />
        </div>
      </Card>

      {/* Risk Analysis */}
      <Card id="risk-analysis" className="p-6">
        <SectionHeader icon={<AlertTriangle className="w-6 h-6 text-red-600" />} title="Risk Analysis" />
        <div className="space-y-4">
          {report.riskAnalysis.map((risk, index) => (
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