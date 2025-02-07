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
  const [currentStreamMode, setCurrentStreamMode] = useState<StreamMode>(defaultStreamMode);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasMessages, setHasMessages] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("research_assistant");

  console.log("[Home] Initial render with state:", {
    currentStreamMode,
    isInitializing,
    hasMessages,
    selectedAgentId
  });

  const handleMessagesChange = (messages: Message[]) => {
    console.log("[Home] Messages changed:", { messageCount: messages.length });
    setHasMessages(messages.length > 0);
  };

  const handleStreamModeChange = (mode: StreamMode) => {
    console.log("[Home] Stream mode changed:", { mode });
    setCurrentStreamMode(mode);
  };

  const handleAgentSelect = (agentId: string) => {
    console.log("[Home] Agent selected:", { agentId });
    setSelectedAgentId(agentId);
    // Reset messages when switching agents
    setHasMessages(false);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <BarLoader
          color={"#6366f1"}
          loading={isInitializing}
          width={"100%"}
          height={8}
        />
      </div>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 min-h-[calc(100vh-4rem)] flex flex-col">
        {!hasMessages && (
           <div className="flex-1">
            <Hero />
            <AIAgents 
              onAgentSelect={handleAgentSelect}
              selectedAgentId={selectedAgentId}
            />
          </div>
        )}
        
        <div className={`py-4${hasMessages ? 'flex-1' : ''}`}>
          <ChatInterface 
            model={defaultModel}
            streamMode={currentStreamMode}
            isInitializing={isInitializing}
            setIsInitializing={setIsInitializing}
            onMessagesChange={handleMessagesChange}
            onStreamModeChange={handleStreamModeChange}
            selectedAgentId={selectedAgentId}
          />
        </div>
      </div>
    </main>
  )
}
