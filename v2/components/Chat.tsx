"use client"

import { useState, useEffect } from "react"
import { createAssistantThread, sendMessage, getMessages } from "@/lib/langchain"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mic, SendHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { AgentType, agentInfo } from "@/lib/agents"

interface ChatProps {
  setIsInitializing: (value: boolean) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id?: string;
}

export default function Chat({ setIsInitializing }: ChatProps) {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("report_maistro")
  const { toast } = useToast()

  useEffect(() => {
    // Initialize chat thread when component mounts
    const initializeChat = async () => {
      try {
        const { threadId } = await createAssistantThread(selectedAgent)
        setThreadId(threadId)
      } catch (error) {
        console.error("Error initializing chat:", error)
        toast({
          variant: "destructive",
          title: "Chat Initialization Failed",
          description: "Unable to connect to the chat service. Please try refreshing the page.",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initializeChat()
  }, [setIsInitializing, toast, selectedAgent])

  const handleAgentSelect = async (agentId: AgentType) => {
    if (agentId === selectedAgent) return;
    setIsInitializing(true);
    setSelectedAgent(agentId);
    setMessages([]);
    setThreadId(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!threadId || !inputMessage.trim()) return

    setIsLoading(true)
    try {
      // Send the message
      await sendMessage(threadId, inputMessage)
      
      // Get updated messages
      const updatedMessages = await getMessages(threadId)
      setMessages(updatedMessages)
      
      // Clear input
      setInputMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Failed to Send Message",
        description: "There was an error sending your message. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {Object.entries(agentInfo).map(([agentId, info]) => {
          const Icon = info.icon;
          const isSelected = selectedAgent === agentId;
          return (
            <Card 
              key={agentId}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-md group",
                isSelected 
                  ? `border-2 ${info.borderColor} shadow-lg ${info.bgColor} bg-opacity-50` 
                  : "border border-gray-200 hover:bg-gray-50",
              )}
              onClick={() => handleAgentSelect(agentId as AgentType)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("p-2 rounded-lg transition-colors", info.bgColor, isSelected ? "bg-opacity-100" : "bg-opacity-75")}>
                  <Icon className={cn("w-6 h-6", info.color)} />
                </div>
                <h3 className={cn(
                  "font-semibold text-lg",
                  isSelected ? info.color : "text-gray-800 group-hover:text-gray-900"
                )}>
                  {info.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{info.description}</p>
            </Card>
          );
        })}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          <Card key={index} className="p-4 bg-white shadow-sm">
            <div className="font-semibold mb-1 text-gray-800">
              {message.role === "user" ? "You" : "Assistant"}:
            </div>
            <div className="text-gray-600">{message.content}</div>
          </Card>
        ))}
      </div>
      
      <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-left mb-4">
          <p className="text-gray-600 text-sm font-light">
            {agentInfo[selectedAgent].description}
          </p>
        </div>
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-4 pr-24 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!threadId || isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              type="button" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={!threadId || isLoading}
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              type="submit" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={!threadId || isLoading}
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
    </div>
  )
} 