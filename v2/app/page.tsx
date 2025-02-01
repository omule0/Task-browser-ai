"use client";

import AIAgents from "@/components/AIAgents"
import ChatInterface from "@/components/ChatInterface"
import Hero from "@/components/Hero"
import { Model } from "@/types"
import { StreamMode } from "@/components/Agentsettings"
import { BarLoader } from "react-spinners"
import { useState } from "react"

export default function Home() {
  // Default values based on the AgentSettings component
  const defaultModel: Model = "gpt-4o-mini"
  const defaultStreamMode: StreamMode = "updates"
  const [isInitializing, setIsInitializing] = useState(true);

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 pb-8">
      <div className="fixed top-0 left-0 right-0 z-50">
        <BarLoader
          color={"#6366f1"}
          loading={isInitializing}
          width={"100%"}
          height={4}
        />
      </div>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Hero />
        
        <div className="mb-12">
          <ChatInterface 
            model={defaultModel}
            streamMode={defaultStreamMode}
            isInitializing={isInitializing}
            setIsInitializing={setIsInitializing}
          />
        </div>
        <AIAgents />
      </div>
    </main>
  )
}

