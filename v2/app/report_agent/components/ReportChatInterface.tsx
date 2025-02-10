"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";
import MessageList from "@/components/MessageList";
import { StreamMode } from "@/components/Agentsettings";
import { Message, Model, ThreadState } from "@/types";
import { handleStreamEvent } from "@/utils/streamHandler";
import { Send, Settings } from "lucide-react";
import {
  createAssistant,
  createThread,
  getThreadState,
  sendMessage,
  updateState,
  verifyAssistant,
  verifyThread,
} from "@/utils/chatApi";
import { ASSISTANT_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/utils/cookies";
import { useToast } from "@/hooks/use-toast";
import SkeletonMessage from "@/components/SkeletonMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReportChatInterfaceProps {
  onLoadingChange?: (isLoading: boolean) => void;
  model: Model;
  streamMode: StreamMode;
  isInitializing: boolean;
  setIsInitializing: (value: boolean) => void;
  onMessagesChange?: (messages: Message[]) => void;
  onStreamModeChange?: (mode: StreamMode) => void;
  selectedTemplate: string | null;
  query: string;
  setQuery: (query: string) => void;
}

interface SearchSettings {
  numberOfQueries: number;
  tavilyTopic: "general" | "news";
  tavilyDays?: number;
}

const templateStructures = {
  comparative_analysis: `
1. Introduction
   - Brief overview and context for comparison

2. Main Body Sections
   - One dedicated section for each offering being compared
   - Each section examines:
     * Core Features
     * Architecture & Implementation
     * Example use case

3. Conclusion with Comparison Table
   - Structured comparison across key dimensions
   - Highlights relative strengths and weaknesses
   - Final recommendations
  `,
  business_strategy: `
1. Introduction
   - Overview of business challenge and objectives

2. Case Studies Analysis
   - Three focused case studies from successful examples
   - For each case study:
     * Core business model and value proposition
     * Specific strategies that drove success
     * Surprising or non-obvious insight
     * Relevant lessons for current challenge

3. Conclusion
   - Success factors comparison
   - Common patterns and differentiators
   - Actionable recommendations
  `,
  how_to: `
1. Introduction
   - Brief overview of technologies
   - Problem statement

2. Implementation Stages
   - Each stage covers:
     * Problem Statement
     * Technical Approach
     * Key Components
     * Integration Points

3. Conclusion
   - Key technical takeaways
   - Integration benefits
   - Future considerations
  `,
  recent_events: `
1. Introduction
   - Brief overview of topic area
   - Context for business trends analysis

2. Main Body Sections
   - One dedicated section per company
   - Each section covers:
     * Significant business events
     * Product launches and updates
     * Market strategy shifts
     * Industry patterns
     * Competitive dynamics

3. Conclusion
   - Timeline of key events
   - Emerging industry patterns
   - Market implications
  `
};

export default function ReportChatInterface({
  onLoadingChange,
  model,
  streamMode,
  isInitializing,
  setIsInitializing,
  onMessagesChange,
  onStreamModeChange,
  selectedTemplate,
  query,
  setQuery
}: ReportChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadState, setThreadState] = useState<ThreadState>();
  const [graphInterrupted, setGraphInterrupted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [allowNullMessage, setAllowNullMessage] = useState(false);
  const [searchSettings, setSearchSettings] = useState<SearchSettings>({
    numberOfQueries: 2,
    tavilyTopic: "general",
  });

  const messageListRef = useRef<HTMLDivElement>(null);
  const AGENT_ID = "report_maistro";

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get or create assistant ID
        let assistantId = getCookie(`${ASSISTANT_ID_COOKIE}_${AGENT_ID}`);
        
        // Verify assistant if it exists
        if (assistantId) {
          const isAssistantValid = await verifyAssistant(assistantId, AGENT_ID);
          if (!isAssistantValid) {
            console.log("Assistant not found, creating new one");
            const assistant = await createAssistant(AGENT_ID);
            assistantId = assistant.assistant_id;
            setCookie(`${ASSISTANT_ID_COOKIE}_${AGENT_ID}`, assistantId);
          }
        } else {
          // Create new assistant if none exists
          const assistant = await createAssistant(AGENT_ID);
          assistantId = assistant.assistant_id;
          setCookie(`${ASSISTANT_ID_COOKIE}_${AGENT_ID}`, assistantId);
        }

        // Create thread and verify it
        const { thread_id } = await createThread();
        const isThreadValid = await verifyThread(thread_id);
        
        if (!isThreadValid) {
          throw new Error("Failed to create a valid thread");
        }

        setThreadId(thread_id);
        setAssistantId(assistantId);
        setUserId(uuidv4());
      } catch (err) {
        console.error("Error initializing chat:", err);
        
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Unable to connect to the server. Please check your internet connection and try again.",
            duration: 5000,
          });
          return;
        }

        toast({
          variant: "destructive",
          title: "Chat Initialization Failed",
          description: "Unable to start the chat. Please try refreshing the page.",
          duration: 5000,
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [toast, setIsInitializing]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!query.trim() || !selectedTemplate) return;
    
    // Format the message to include both query and template
    const message = `Generate a ${selectedTemplate.replace(/_/g, ' ')} report about: ${query}`;
    
    if (!threadId || !assistantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Chat is not properly initialized. Please try refreshing the page.",
      });
      return;
    }

    // Verify thread and assistant still exist
    try {
      const [isThreadValid, isAssistantValid] = await Promise.all([
        verifyThread(threadId),
        verifyAssistant(assistantId, AGENT_ID)
      ]);

      if (!isThreadValid || !isAssistantValid) {
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Your chat session has expired. Please refresh the page to start a new conversation.",
        });
        return;
      }
    } catch (error) {
      console.error("Error verifying chat session:", error);
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: "Failed to verify chat session. Please try again or refresh the page.",
      });
      return;
    }

    const messageId = uuidv4();
    setMessages((prev) => [...prev, { text: message, sender: "user", id: messageId }]);

    try {
      setIsLoading(true);
      setThreadState(undefined);

      // Initialize state for report_maistro agent with search settings
      const initialState = {
        topic: message.trim(),
        feedback_on_report_plan: "",
        accept_report_plan: false,
        report_structure: templateStructures[selectedTemplate as keyof typeof templateStructures],
        sections: [],
        completed_sections: [],
        report_sections_from_research: "",
        final_report: "",
        number_of_queries: searchSettings.numberOfQueries,
        tavily_topic: searchSettings.tavilyTopic,
        ...(searchSettings.tavilyTopic === "news" && searchSettings.tavilyDays 
          ? { tavily_days: searchSettings.tavilyDays }
          : {})
      };

      const response = await sendMessage({
        threadId,
        assistantId,
        message,
        messageId,
        model,
        userId,
        streamMode,
        initialState,
      });

      for await (const chunk of response) {
        handleStreamEvent(chunk, setMessages, streamMode);
      }

      const currentState = await getThreadState(threadId);
      setThreadState(currentState);

      // Clear the query after sending
      setQuery("");

    } catch (err) {
      console.error("Error in message flow:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while processing your message. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterruptResponse = async (response: string) => {
    if (!threadId) return;

    try {
      setIsLoading(true);

      // Update state with the feedback
      await updateState(threadId, {
        newState: {
          feedback_on_report_plan: response,
          accept_report_plan: true
        }
      });

      // Reset states
      setGraphInterrupted(false);
      setAllowNullMessage(true);
      setFeedback("");

    } catch (err) {
      console.error("Error handling interrupt response:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your feedback. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!threadId || !assistantId) return;

    try {
      setIsLoading(true);
      setAllowNullMessage(false);

      const response = await sendMessage({
        threadId,
        assistantId,
        message: null,
        messageId: uuidv4(),
        model,
        userId,
        streamMode
      });

      for await (const chunk of response) {
        handleStreamEvent(chunk, setMessages, streamMode);
      }

      const currentState = await getThreadState(threadId);
      setThreadState(currentState);

      // Check if we need to show another interrupt
      if (currentState.next.includes("human_feedback")) {
        setGraphInterrupted(true);
      }

    } catch (err) {
      console.error("Error in continue flow:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while continuing. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (threadState?.next.includes("human_feedback")) {
      setGraphInterrupted(true);
    }
  }, [threadState]);

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  if (isInitializing) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {messages.length > 0 && (
        <div className="flex-1 mb-6">
          <div 
            ref={messageListRef}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="px-2"
              >
                <MessageList messages={messages} />
                {isLoading && <SkeletonMessage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {graphInterrupted && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Review Report Plan</h3>
          <p className="text-sm text-blue-600 mb-4">Please review the report plan above and provide any feedback or suggestions for improvement.</p>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            className="mb-4 min-h-[100px]"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => handleInterruptResponse("")}
              disabled={isLoading}
            >
              Accept Plan
            </Button>
            <Button
              onClick={() => handleInterruptResponse(feedback)}
              disabled={!feedback.trim() || isLoading}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      )}

      {allowNullMessage && !graphInterrupted && (
        <div className="flex justify-center mb-6">
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            variant="outline"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Search Input */}
      <div className="w-full h-[60px] bg-white rounded-full shadow-lg flex items-center px-6 hover:shadow-xl transition-shadow duration-300">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask me to research any topic..."
          className="flex-1 text-lg text-gray-600 placeholder-gray-400 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={graphInterrupted || allowNullMessage}
        />
        <div className="flex items-center ml-4 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-gray-100 rounded-full"
                disabled={graphInterrupted || allowNullMessage}
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Search Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure the search parameters for your report
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="queries">Queries</Label>
                    <Input
                      id="queries"
                      type="number"
                      className="col-span-2"
                      value={searchSettings.numberOfQueries}
                      onChange={(e) => setSearchSettings(prev => ({
                        ...prev,
                        numberOfQueries: Math.max(1, parseInt(e.target.value) || 1)
                      }))}
                      min={1}
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="topic">Topic</Label>
                    <Select
                      value={searchSettings.tavilyTopic}
                      onValueChange={(value: "general" | "news") => setSearchSettings(prev => ({
                        ...prev,
                        tavilyTopic: value,
                        tavilyDays: value === "general" ? undefined : prev.tavilyDays
                      }))}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {searchSettings.tavilyTopic === "news" && (
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="days">Days</Label>
                      <Input
                        id="days"
                        type="number"
                        className="col-span-2"
                        value={searchSettings.tavilyDays}
                        onChange={(e) => setSearchSettings(prev => ({
                          ...prev,
                          tavilyDays: Math.max(1, parseInt(e.target.value) || 1)
                        }))}
                        min={1}
                      />
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={handleSendMessage}
            disabled={!query.trim() || !selectedTemplate || isLoading || graphInterrupted || allowNullMessage}
          >
            <Send className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
} 