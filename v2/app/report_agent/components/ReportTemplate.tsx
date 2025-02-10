interface ReportTemplateProps {
  templateName: string;
  instructions: string[];
}

export function ReportTemplate({ templateName, instructions }: ReportTemplateProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      <h3 className="text-lg font-semibold text-blue-600 mb-4">{templateName}</h3>
      <div className="space-y-2">
        {instructions.map((instruction, index) => (
          <p key={index} className="text-neutral-600 text-sm">
            {instruction}
          </p>
        ))}
      </div>
    </div>
  );
}

export const templates = {
  comparative_analysis: {
    templateName: "Comparative Analysis Report",
    instructions: [
      "1. Introduction - Brief overview and context for comparison (no research needed)",
      "2. Main Body Sections - One dedicated section for EACH offering being compared in the user-provided list",
      " Each section should examine:",
      "   • Core Features (bulleted list)",
      "   • Architecture & Implementation (2-3 sentences)",
      "   • Example use case (2-3 sentences)",
      "3. No Main Body Sections other than the ones dedicated to each offering in the user-provided list",
      "4. Conclusion with Comparison Table (no research needed)",
        "   • Structured comparison across key dimensions:",
        "   • Highlights relative strengths and weaknesses",
        "   • Compares all offerings from the user-provided list across key dimensions",
      "   • Final recommendations"
    ]
  },
  business_strategy: {
    templateName: "Business Strategy Report",
    instructions: [
      "1. Introduction - Overview of business challenge and objectives (no research needed)",
      "2. Three focused case studies that:",
      "   • Draw from successful examples in related/analogous markets", 
      "   • Share similar business model elements",
      "   • Prioritize examples that solved comparable challenges",
      "   • For each case study:",
      "     - Describe core business model and value proposition",
      "     - Highlight specific strategies that drove success",
      "     - Identify one surprising or non-obvious insight",
      "     - Extract lessons relevant to the current challenge",
      "3. Conclusion with comparative analysis:",
      "   • Success factors comparison across case studies",
      "   • Common patterns and differentiators", 
      "   • Translate insights into actionable recommendations",
      "   • Final strategic recommendations"
    ]
  },
  how_to: {
    templateName: "How to",
    instructions: [
      "1. Introduction (no research needed)",
      "   • Brief overview of the technologies involved ",
      "   • Brief overview of the problem or need ",
      "2. Implementation Stages:",
      "   • Each stage should be a distinct section covering:",
      "     - Problem Statement: What needed to be solved",
      "     - Technical Approach: How it was implemented",
      "     - Key Components: Tools, frameworks, or services used",
      "     - Integration Points: How it connects to other parts",
      "   • Only include sections that cover unique aspects - do not force a specific number of sections. Aim for at most 3 sections to keep the report concise.",
      "3. Conclusion (no research needed):",
      "   • Key technical takeaways",
      "   • Integration benefits",
      "   • Future technical considerations",
    "   • Each section should emphasize:",
    "     - Specific technical details",
    "     - Concrete implementation examples",
    "     - Measurable improvements"
    ]
  },
  recent_events: {
    templateName: "Recent Events",
    instructions: [
      "1. Introduction (no research needed)",
      "   • Brief overview of the topic area",
      "   • Context for the business trends analysis",
      "2. Main Body Sections:",
      "   • One dedicated section for EACH company being tracked in the user-provided list",
      "   • Each section should examine the news and highlight any of the following:",
      "     - Tracking significant business events (funding, acquisitions, partnerships)",
      "     - Analyzing product launches and feature updates",
      "     - Shifts in market strategy and positioning",
      "     - Identifying emerging patterns across the industry",
      "     - Considering competitive responses and market dynamics",
      "3. No Main Body Sections other than the ones dedicated to each company in the user-provided list",
      "4. Conclusion",
      "   • A timeline of key events across companies",
      "   • Analysis of emerging industry patterns",
      "   • Implications for the broader market"
    ]
  }
}; 