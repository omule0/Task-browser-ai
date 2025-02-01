"use client"

import type React from "react"
import { useState } from "react"
import { Mic, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import Prompts from "./Prompts"

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  className?: string;
  onSettingsClick?: () => void;
  onLinkClick?: () => void;
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  className,
  onSettingsClick,
  onLinkClick
}: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <div className={cn("w-full max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg", className)}>
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-4 pr-24 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              type="button" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={disabled}
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              type="submit" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={disabled}
              aria-label="Send message"
            >
              {disabled ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
              ) : (
                <Send className="w-5 h-5 text-gray-600" />
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

