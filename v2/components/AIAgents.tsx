"use client"

import { Code, BookOpen, ChevronRight } from "lucide-react"

const agents = [
  {
    id: "research_assistant",
    icon: Code,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    title: "Research Assistant",
    description: "AI-powered research assistant that helps gather and analyze information on any topic.",
  },
  {
    id: "essay_writer",
    icon: BookOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    title: "Essay Writer",
    description: "Expert essay writer that helps create well-structured essays with proper research and citations.",
  },
]

interface AIAgentsProps {
  onAgentSelect?: (agentId: string) => void;
  selectedAgentId?: string;
}

export default function AIAgents({ onAgentSelect, selectedAgentId }: AIAgentsProps) {
  return (
    <div id="webcrumbs" className="w-full px-4 sm:px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Your AI agents</h2>
          <a href="#" className="flex items-center text-xs sm:text-sm hover:underline group">
            All agents
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {agents.map((agent) => (
            <div
              key={agent.title}
              className={`bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100 cursor-pointer ${
                selectedAgentId === agent.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => agent.id && onAgentSelect?.(agent.id)}
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
