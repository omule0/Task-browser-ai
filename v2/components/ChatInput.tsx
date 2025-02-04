"use client"

import type React from "react"
import { useState } from "react"
import { Mic, SendHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import Prompts from "./Prompts"
import { StreamMode } from "./Agentsettings"
import AgentSettings from "./Agentsettings"

interface ChatInputProps {
  onSendMessage: (message: string | null) => void;
  className?: string;
  onStreamModeChange?: (mode: StreamMode) => void;
  onSettingsClick?: () => void;
  onLinkClick?: () => void;
  isLoading?: boolean;
  currentStreamMode?: StreamMode;
  allowNullMessage: boolean;
  selectedAgentId?: string;
}

const getPlaceholderText = (agentId?: string) => {
  switch (agentId) {
    case 'essay_writer':
      return "Enter your essay topic or requirements...";
    case 'research_assistant':
      return "Ask me to research any topic...";
    default:
      return "Type a message...";
  }
};

export default function ChatInput({
  onSendMessage,
  className,
  onStreamModeChange,
  onSettingsClick,
  onLinkClick,
  isLoading = false,
  currentStreamMode = "updates",
  allowNullMessage,
  selectedAgentId
}: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const placeholderText = getPlaceholderText(selectedAgentId);

  return (
    <div className={cn("w-full max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg", className)}>
      <div className="text-left mb-4">
        <p className="text-gray-600 text-sm font-light">
          {selectedAgentId === 'essay_writer' 
            ? "Let me help you write a well-structured essay!"
            : "Select an agent and ask away!"}
        </p>
      </div>
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder={placeholderText}
            className="w-full p-4 pr-24 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <AgentSettings
              onModelChange={() => {}}
              onStreamModeChange={onStreamModeChange || (() => {})}
              currentModel="gpt-4o-mini"
              currentStreamMode={currentStreamMode}
              className="shrink-0"
            />
            <button 
              type="button" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              type="submit" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
              ) : (
                <SendHorizontal className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </form>
      </div>
      <Prompts 
        onSettingsClick={onSettingsClick}
        onLinkClick={onLinkClick}
        onMessageSelect={onSendMessage}
      />
    </div>
  )
}
