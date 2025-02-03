"use client"

import { FileText, PenSquare, LucideIcon } from "lucide-react"
import { useState } from "react"

export interface Agent {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  title: string;
  description: string;
  graphId: string;
}

const agents: Agent[] = [
  {
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    title: "Research Assistant",
    description: "Expert at conducting research, analyzing information, and providing comprehensive insights on any topic.",
    graphId: "research_assistant"
  },
  {
    icon: PenSquare,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    title: "Essay Writer",
    description: "Specialized in crafting well-structured essays with clear arguments and supporting evidence.",
    graphId: "essay_writer"
  }
]

interface AIAgentsProps {
  onAgentSelect?: (agent: Agent | null) => void;
  selectedAgent?: Agent | null;
}

export default function AIAgents({ onAgentSelect, selectedAgent }: AIAgentsProps) {
  const [localSelectedAgent, setLocalSelectedAgent] = useState<Agent | null>(selectedAgent || null)

  const handleAgentSelect = (agent: Agent) => {
    const newSelectedAgent = localSelectedAgent?.title === agent.title ? null : agent
    setLocalSelectedAgent(newSelectedAgent)
    onAgentSelect?.(newSelectedAgent)
  }

  return (
    <div id="webcrumbs" className="w-full px-4 sm:px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Your AI agents</h2>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {agents.length} agents available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {agents.map((agent) => (
            <div
              key={agent.title}
              className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100 cursor-pointer ${
                (selectedAgent || localSelectedAgent)?.title === agent.title ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleAgentSelect(agent)}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`${agent.bgColor} p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0`}>
                  <agent.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${agent.color}`} />
                </div>
                <div>
                  <h3 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">{agent.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">{agent.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

