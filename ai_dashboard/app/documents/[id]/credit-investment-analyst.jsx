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
  Scale,
  Wallet,
  Shield,
  FileText,
  TrendingUp,
  Briefcase
} from "lucide-react";
import ReportActions from "@/components/report-actions";

export default function CreditInvestmentAnalyst({ report }) {
  const sections = [
    { id: "executive-summary", title: "Executive Summary" },
    { id: "borrower-profile", title: "Borrower Profile" },
    { id: "industry-analysis", title: "Industry Analysis" },
    { id: "financial-analysis", title: "Financial Analysis" },
    { id: "credit-metrics", title: "Credit Metrics" },
    { id: "cash-flow-analysis", title: "Cash Flow Analysis" },
    { id: "risk-assessment", title: "Risk Assessment" },
    { id: "collateral-analysis", title: "Collateral Analysis" },
    { id: "covenant-review", title: "Covenant Review" },
    { id: "esg-analysis", title: "ESG Analysis" },
    { id: "scenario-analysis", title: "Scenario Analysis" },
    { id: "comparative-analysis", title: "Comparative Analysis" },
    { id: "investment-recommendation", title: "Investment Recommendation" },
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
            <h3 className="font-medium mb-2">Credit Rating</h3>
            <p>{report.executiveSummary.creditRating}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Risk Assessment</h3>
            <p>{report.executiveSummary.riskAssessment}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Financial Position</h3>
            <p>{report.executiveSummary.financialPosition}</p>
          </div>
          <SourceTag source={report.executiveSummary.source} />
        </div>
      </Card>

      {/* Borrower Profile */}
      <Card id="borrower-profile" className="p-6">
        <SectionHeader icon={<Building2 className="w-6 h-6 text-gray-600" />} title="Borrower Profile" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Background</h3>
            <p>{report.borrowerProfile.background}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Business Model</h3>
            <p>{report.borrowerProfile.businessModel}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Structure</h3>
            <p>{report.borrowerProfile.structure}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Market Position</h3>
            <p>{report.borrowerProfile.marketPosition}</p>
          </div>
          <SourceTag source={report.borrowerProfile.source} />
        </div>
      </Card>

      {/* Credit Metrics */}
      <Card id="credit-metrics" className="p-6">
        <SectionHeader icon={<Target className="w-6 h-6 text-purple-600" />} title="Credit Metrics" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Debt Structure</h3>
            <p>{report.creditMetrics.debtStructure}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Maturity Profile</h3>
            <p>{report.creditMetrics.maturityProfile}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Covenants</h3>
            <ul className="list-disc pl-5">
              {report.creditMetrics.covenants.map((covenant, index) => (
                <li key={index}>{covenant}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Credit Metrics</h3>
            {report.creditMetrics.metrics.map((metric, index) => (
              <div key={index} className="mb-4 border-b pb-2">
                <p className="font-medium">{metric.metric}: {metric.value}</p>
                <p className="text-sm text-gray-600">{metric.analysis}</p>
              </div>
            ))}
          </div>
          <SourceTag source={report.creditMetrics.source} />
        </div>
      </Card>

      {/* Cash Flow Analysis */}
      <Card id="cash-flow-analysis" className="p-6">
        <SectionHeader icon={<Wallet className="w-6 h-6 text-green-600" />} title="Cash Flow Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Operating Cash Flow</h3>
            <p>{report.cashFlowAnalysis.operatingCashFlow}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Capital Expenditures</h3>
            <p>{report.cashFlowAnalysis.capitalExpenditures}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Free Cash Flow</h3>
            <p>{report.cashFlowAnalysis.freeCashFlow}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Liquidity</h3>
            <p>{report.cashFlowAnalysis.liquidity}</p>
          </div>
          <SourceTag source={report.cashFlowAnalysis.source} />
        </div>
      </Card>

      {/* Investment Recommendation */}
      <Card id="investment-recommendation" className="p-6">
        <SectionHeader icon={<TrendingUp className="w-6 h-6 text-indigo-600" />} title="Investment Recommendation" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Recommendation</h3>
            <p className="uppercase font-bold text-blue-600">{report.investmentRecommendation.recommendation}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Rationale</h3>
            <p>{report.investmentRecommendation.rationale}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Target Yield</h3>
            <p>{report.investmentRecommendation.targetYield}</p>
          </div>
          <SourceTag source={report.investmentRecommendation.source} />
        </div>
      </Card>

      {/* Industry Analysis */}
      <Card id="industry-analysis" className="p-6">
        <SectionHeader icon={<Globe className="w-6 h-6 text-green-600" />} title="Industry Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Overview</h3>
            <p>{report.industryAnalysis.overview}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Market Trends</h3>
            <ul className="list-disc pl-5">
              {report.industryAnalysis.trends.map((trend, index) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Key Factors</h3>
            <ul className="list-disc pl-5">
              {report.industryAnalysis.factors.map((factor, index) => (
                <li key={index}>{factor}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Competition</h3>
            <p>{report.industryAnalysis.competition}</p>
          </div>
          <SourceTag source={report.industryAnalysis.source} />
        </div>
      </Card>

      {/* Financial Analysis */}
      <Card id="financial-analysis" className="p-6">
        <SectionHeader icon={<BarChart3 className="w-6 h-6 text-yellow-600" />} title="Financial Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Performance</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Income Statement:</span> {report.financialAnalysis.performance.income}</p>
              <p><span className="font-medium">Balance Sheet:</span> {report.financialAnalysis.performance.balance}</p>
              <p><span className="font-medium">Cash Flow:</span> {report.financialAnalysis.performance.cashflow}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Financial Ratios</h3>
            {report.financialAnalysis.ratios.map((ratio, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">{ratio.category}</h4>
                {ratio.metrics.map((metric, idx) => (
                  <div key={idx} className="mb-2 pl-4 border-l-2 border-gray-200">
                    <p className="font-medium">{metric.name}: {metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.analysis}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <SourceTag source={report.financialAnalysis.source} />
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

      {/* Collateral Analysis */}
      <Card id="collateral-analysis" className="p-6">
        <SectionHeader icon={<Shield className="w-6 h-6 text-orange-600" />} title="Collateral Analysis" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Assets</h3>
            <ul className="list-disc pl-5">
              {report.collateralAnalysis.assets.map((asset, index) => (
                <li key={index}>{asset}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Valuation</h3>
            <p>{report.collateralAnalysis.valuation}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Recovery Analysis</h3>
            <p>{report.collateralAnalysis.recovery}</p>
          </div>
          <SourceTag source={report.collateralAnalysis.source} />
        </div>
      </Card>

      {/* Covenant Review */}
      <Card id="covenant-review" className="p-6">
        <SectionHeader icon={<FileText className="w-6 h-6 text-purple-600" />} title="Covenant Review" />
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Compliance Status</h3>
            <p>{report.covenantReview.compliance}</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Restrictions</h3>
            <ul className="list-disc pl-5">
              {report.covenantReview.restrictions.map((restriction, index) => (
                <li key={index}>{restriction}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Legal Issues</h3>
            <ul className="list-disc pl-5">
              {report.covenantReview.legalIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
          <SourceTag source={report.covenantReview.source} />
        </div>
      </Card>

      {/* ESG Analysis */}
      <Card id="esg-analysis" className="p-6">
        <SectionHeader icon={<Scale className="w-6 h-6 text-green-600" />} title="ESG Analysis" />
        <div className="space-y-4">
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

      {/* Scenario Analysis */}
      <Card id="scenario-analysis" className="p-6">
        <SectionHeader icon={<LineChart className="w-6 h-6 text-blue-600" />} title="Scenario Analysis" />
        <div className="space-y-4">
          {report.scenarioAnalysis.map((scenario, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-medium mb-2">{scenario.scenario}</h3>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Assumptions:</h4>
                  <ul className="list-disc pl-5">
                    {scenario.assumptions.map((assumption, idx) => (
                      <li key={idx}>{assumption}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Impact:</h4>
                  <p>{scenario.impact}</p>
                </div>
              </div>
              <SourceTag source={scenario.source} />
            </div>
          ))}
        </div>
      </Card>

      {/* Comparative Analysis */}
      <Card id="comparative-analysis" className="p-6">
        <SectionHeader icon={<Briefcase className="w-6 h-6 text-indigo-600" />} title="Comparative Analysis" />
        <div className="space-y-4">
          {report.comparativeAnalysis.map((peer, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-medium mb-2">{peer.peer}</h3>
              <div className="space-y-2">
                {peer.metrics.map((metric, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="font-medium">{metric.metric}: {metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.comparison}</p>
                  </div>
                ))}
              </div>
              <SourceTag source={peer.source} />
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