"use client"

import { templates } from "./components/ReportTemplate"
import { useState } from "react"
import ReportChatInterface from "./components/ReportChatInterface"
import { StreamMode } from "@/components/Agentsettings"

const templateDescriptions = {
  comparative_analysis: "Compare and analyze different offerings, examining their features, architecture, and use cases to provide clear recommendations.",
  business_strategy: "Learn from successful case studies to develop actionable business strategies and insights for your specific challenge.",
  how_to: "Get detailed technical implementation guides with step-by-step instructions and best practices.",
  recent_events: "Track and analyze recent developments, market trends, and significant events across companies in your industry."
}

export default function ReportAgentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)
  const [streamMode, setStreamMode] = useState<StreamMode>("custom")

  return (
    <div className="flex justify-center p-8">
      <div className="w-[800px] bg-white rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Create Report</h1>

        {/* Template Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Report Template</h2>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(templates).map(([key, template]) => (
              <div 
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`bg-white rounded-xl p-6 border border-neutral-200 cursor-pointer transition-all ${
                  selectedTemplate === key 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-lg hover:border-blue-200'
                }`}
              >
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{template.templateName}</h3>
                <p className="text-neutral-600 text-sm">
                  {templateDescriptions[key as keyof typeof templateDescriptions]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <ReportChatInterface
          model="gpt-4"
          streamMode={streamMode}
          isInitializing={isInitializing}
          setIsInitializing={setIsInitializing}
          onStreamModeChange={setStreamMode}
          selectedTemplate={selectedTemplate}
          query={query}
          setQuery={setQuery}
        />
      </div>
    </div>
  )
} 