import { FileText, Search, LineChart } from "lucide-react";

export const documentTypes = [
  { icon: <FileText className="h-6 w-6" />, title: "Report" },
];

export const subTypes = {
  Report: [
    {
      icon: <Search className="h-5 w-5" />,
      title: "Research report",
      description: "A detailed document presenting clear findings and analysis",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      title: "Buyside Due Diligence",
      description: "Comprehensive evaluation of target company for acquisition or investment",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      title: "Sellside Due Diligence",
      description: "Comprehensive document prepared by the seller to provide potential buyers with a transparent view of the target company",
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
  },
};