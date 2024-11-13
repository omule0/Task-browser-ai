import { FileText, Search } from "lucide-react";

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
  },
};