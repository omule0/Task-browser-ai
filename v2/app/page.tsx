import AIAgents from "@/components/AIAgents"
import ChatInterface from "@/components/ChatInterface"
import Hero from "@/components/Hero"
import { Model } from "@/types"
import { StreamMode } from "@/components/Agentsettings"

export default function Home() {
  // Default values based on the AgentSettings component
  const defaultModel: Model = "gpt-4o-mini"
  const defaultStreamMode: StreamMode = "updates"

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 pb-8">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Hero />
        <AIAgents />
        <ChatInterface 
          model={defaultModel}
          streamMode={defaultStreamMode}
        />
      </div>
    </main>
  )
}

