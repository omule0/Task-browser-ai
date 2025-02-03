'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { StreamMode } from '@/components/Agentsettings';
import Hero from '@/components/Hero';
import AIAgents, { Agent } from '@/components/AIAgents';
import { Model, Message } from "@/types";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  // Default values based on the AgentSettings component
  const defaultModel: Model = "gpt-4o-mini";
  const defaultStreamMode: StreamMode = "updates";
  const [currentStreamMode, setCurrentStreamMode] = useState<StreamMode>(defaultStreamMode);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasMessages, setHasMessages] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    // Initialize chat with the given ID
    console.log('Initializing chat with ID:', resolvedParams.chatId);
    setIsInitializing(false);
  }, [resolvedParams.chatId]);

  const handleMessagesChange = (messages: Message[]) => {
    setHasMessages(messages.length > 0);
    console.log('Messages changed:', messages.length);
  };

  const handleStreamModeChange = (mode: StreamMode) => {
    setCurrentStreamMode(mode);
    console.log('Stream mode changed:', mode);
  };

  const handleAgentSelect = (agent: Agent | null) => {
    setSelectedAgent(agent);
    // Reset chat state when switching agents
    setHasMessages(false);
    setIsInitializing(true);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Show Hero and AIAgents only when there are no messages */}
        {!hasMessages && (
          <>
            <Hero />
            <AIAgents 
              onAgentSelect={handleAgentSelect}
              selectedAgent={selectedAgent}
            />
          </>
        )}

        {/* Chat Interface */}
        <div className={`py-4 ${!hasMessages ? 'min-h-[calc(100vh-2rem)]' : ''}`}>
          <ChatInterface
            model={defaultModel}
            streamMode={currentStreamMode}
            isInitializing={isInitializing}
            setIsInitializing={setIsInitializing}
            onMessagesChange={handleMessagesChange}
            onStreamModeChange={handleStreamModeChange}
            selectedAgent={selectedAgent}
          />
        </div>
      </div>
    </main>
  );
} 