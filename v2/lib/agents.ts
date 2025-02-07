import { Bot, PenLine, FileText, LucideIcon } from "lucide-react"

export type AgentType = "research_assistant" | "essay_writer" | "report_maistro";

export interface AgentInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  samplePrompts: string[];
}

export const agentInfo: Record<AgentType, AgentInfo> = {
  report_maistro: {
    name: "Report Maestro",
    description: "I help you create detailed and organized reports.",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    samplePrompts: [
      "Create a market analysis report for electric vehicles in Europe",
      "Generate a technical report on renewable energy technologies",
      "Write a business impact report for AI adoption in healthcare"
    ]
  },
  research_assistant: {
    name: "Research Assistant",
    description: "I help you research any topic in depth with comprehensive analysis.",
    icon: Bot,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
    samplePrompts: [
      "Research the latest advancements in quantum computing",
      "Analyze the impact of social media on mental health",
      "Investigate sustainable agriculture practices in urban areas"
    ]
  },
  essay_writer: {
    name: "Essay Writer",
    description: "I help you write well-structured essays with clear arguments.",
    icon: PenLine,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-500",
    samplePrompts: [
      "Write an essay about the future of artificial intelligence",
      "Compare and contrast traditional and online education",
      "Discuss the role of technology in modern art"
    ]
  }
};