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
  ],
};

export const documentExamples = {
  Report: {
    "Research report": [
      {
        text: "A research report investigating the adoption of artificial intelligence in small businesses, including case studies and ROI analysis.",
      },
      {
        text: "A detailed research report on emerging renewable energy technologies and their potential impact on urban power grids.",
      },
    ],
    "Buyside Due Diligence": [
      {
        text: "A comprehensive due diligence report for the acquisition of a SaaS company, focusing on their technology stack, market position, and growth potential.",
      },
      {
        text: "Due diligence analysis of a manufacturing company, including operational efficiency, financial health, and market competitiveness assessment.",
      },
    ],
  },
};