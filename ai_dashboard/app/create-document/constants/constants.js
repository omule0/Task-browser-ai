import { FileText, Search, LineChart, BarChart } from "lucide-react";

export const documentTypes = [
  { icon: <FileText className="h-6 w-6" />, title: "Report" },
];

export const subTypes = {
  Report: [
    {
      icon: <img src="/research-report.png" alt="Research Report" className="h-5 w-5" />,
      title: "Research report",
      description: "A detailed document presenting clear findings and analysis",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      title: "Buyside Due Diligence",
      description: "Comprehensive evaluation of target company for acquisition or investment",
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      title: "Sellside Due Diligence",
      description: "Comprehensive document prepared by the seller to provide potential buyers with a transparent view of the target company",
    },
    {
      icon: <img src="/business-plan.png" alt="Business Plan" className="h-5 w-5" />,
      title: "Business Plan",
      description: "A formal document outlining a company’s goals, strategies, market analysis, financial projections, and operational structure",
    },
    {
      icon: <img src="/equity-investment.png" alt="Equity Investment Analyst" className="h-5 w-5" />,
      title: "Equity Investment Analyst Report",
      description: "A comprehensive analysis of a publicly traded company's investment potential, including financial performance, market position, and growth prospects",
    },
    {
      icon: <img src="/credit-investment.png" alt="Credit Investment Analyst" className="h-5 w-5" />,
      title: "Credit Investment Analyst Report",
      description: "A comprehensive evaluation of a borrower's creditworthiness, analyzing financial stability, debt structure, cash flow generation, and associated risks for lenders and credit investors",
    },
  ],
};

export const documentExamples = {
  Report: {
    "Research report": [
      {
        text: "Research report on AI adoption in small businesses with ROI analysis.",
      },
      {
        text: "Report on renewable energy tech and impact on urban power grids.",
      },
    ],
    "Buyside Due Diligence": [
      {
        text: "Due diligence for SaaS company acquisition - tech, market & growth analysis.",
      },
      {
        text: "Manufacturing company due diligence covering operations, financials & market.",
      },
    ],
    "Sellside Due Diligence": [
      {
        text: "Tech company sellside due diligence report.",
      },
      {
        text: "Manufacturing firm sellside report with risks and opportunities.",
      },
    ],
    "Business Plan": [
      {
        text: "Business plan for a new tech startup focusing on innovative AI solutions.",
      },
      {
        text: "Comprehensive business plan for expanding a retail chain into new markets.",
      },
    ],
    "Equity Investment Analyst Report": [
      {
        text: "Tech company growth analysis with AI focus",
      },
      {
        text: "Renewable energy company ESG investment report",
      },
    ],
    "Credit Investment Analyst Report": [
      {
        text: "Corporate bond issuer credit analysis",
      }, 
      {
        text: "Infrastructure project financing assessment",
      },
    ],
  },
};