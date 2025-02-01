"use client"

import { Mail, PlayCircle, Code, Image, ChevronRight } from "lucide-react"
import { useState } from "react"

const agents = [
  {
    icon: Mail,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    title: "Cold Email Template Expert",
    description: "Create effective cold email templates for various purposes.",
  },
  {
    icon: PlayCircle,
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    title: "YouTube Content Writer",
    description: "Generate engaging scripts and content ideas for YouTube videos.",
  },
  {
    icon: Code,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    title: "Pro Coder",
    description: "Get help with coding problems and software development tasks.",
  },
  {
    icon: Image,
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    title: "Blog Image Generator",
    description: "Create eye-catching images for your blog posts and articles.",
  },
]

export default function AIAgents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">Your AI agents</h2>
        <a href="#" className="text-gray-500 hover:text-gray-700 flex items-center">
          All agents
          <ChevronRight className="w-4 h-4 ml-1" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.title}
            className={`bg-white p-4 rounded-xl hover:shadow-lg transition-shadow cursor-pointer ${
              selectedAgent === agent.title ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedAgent(agent.title)}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${agent.bgColor} rounded-lg`}>
                <agent.icon className={`w-5 h-5 ${agent.color}`} />
              </div>
              <div>
                <h3 className="font-medium">{agent.title}</h3>
                <p className="text-sm text-gray-500">{agent.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

