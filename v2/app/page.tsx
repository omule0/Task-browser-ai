"use client";

import AIAgents from "@/components/AIAgents"
import ChatInterface from "@/components/ChatInterface"
import Hero from "@/components/Hero"
import { Model } from "@/types"
import { StreamMode } from "@/components/Agentsettings"
import { BarLoader } from "react-spinners"
import { useState } from "react"
import { Message } from "@/types"

export default function Home() {
  // Default values based on the AgentSettings component
  const defaultModel: Model = "gpt-4o-mini"
  const defaultStreamMode: StreamMode = "updates"
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasMessages, setHasMessages] = useState(false);

  const handleMessagesChange = (messages: Message[]) => {
    setHasMessages(messages.length > 0);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="fixed top-0 left-0 right-0 z-50">
        <BarLoader
          color={"#6366f1"}
          loading={isInitializing}
          width={"100%"}
          height={3}
        />
      </div>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {!hasMessages && (
          <>
            <Hero />
            <AIAgents />
          </>
        )}
        
        <div className={`${hasMessages ? 'min-h-[calc(100vh-2rem)]' : ''}`}>
          <ChatInterface 
            model={defaultModel}
            streamMode={defaultStreamMode}
            isInitializing={isInitializing}
            setIsInitializing={setIsInitializing}
            onMessagesChange={handleMessagesChange}
          />
        </div>
      </div>
    </main>
  )
}

