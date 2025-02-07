import { Bot, PenLine, FileText, LucideIcon } from "lucide-react"

export type AgentType = "research_assistant" | "essay_writer" | "report_maistro";

export interface AgentInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const agentInfo: Record<AgentType, AgentInfo> = {
  report_maistro: {
    name: "Report Maestro",
    description: "I help you create detailed and organized reports.",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
  },
  research_assistant: {
    name: "Research Assistant",
    description: "I help you research any topic in depth with comprehensive analysis.",
    icon: Bot,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
  },
  essay_writer: {
    name: "Essay Writer",
    description: "I help you write well-structured essays with clear arguments.",
    icon: PenLine,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-500",
  }
}; 