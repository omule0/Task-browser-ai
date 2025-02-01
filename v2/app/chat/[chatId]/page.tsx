'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { StreamMode } from '@/components/Agentsettings';
import Hero from '@/components/Hero';
import AIAgents from '@/components/AIAgents';

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasMessages, setHasMessages] = useState(false);
  const resolvedParams = use(params);

  useEffect(() => {
    // Initialize chat with the given ID
    console.log('Initializing chat with ID:', resolvedParams.chatId);
    setIsInitializing(false);
  }, [resolvedParams.chatId]);

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="container mx-auto max-w-7xl p-4 space-y-8">
        {/* Show Hero and AIAgents only when there are no messages */}
        {!hasMessages && (
          <>
            {/* Hero Section */}
            <div className="py-8">
              <Hero />
            </div>

            {/* AI Agents Section */}
            <div className="py-4">
              <AIAgents />
            </div>
          </>
        )}

        {/* Chat Interface */}
        <div className={`py-4 ${!hasMessages ? 'mt-4' : ''}`}>
          <ChatInterface
            model="gpt-4"
            streamMode="updates"
            isInitializing={isInitializing}
            setIsInitializing={setIsInitializing}
            onMessagesChange={(messages) => {
              setHasMessages(messages.length > 0);
              console.log('Messages changed:', messages.length);
            }}
            onLoadingChange={(isLoading) => {
              console.log('Loading state:', isLoading);
            }}
            onStreamModeChange={(mode: StreamMode) => {
              console.log('Stream mode changed:', mode);
            }}
          />
        </div>
      </div>
    </main>
  );
} 