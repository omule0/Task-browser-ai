"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { StreamMode } from "./Agentsettings";
import { Message, Model, ThreadState } from "../types";
import { handleStreamEvent } from "../utils/streamHandler";
import {
  createAssistant,
  createThread,
  getThreadState,
  sendMessage,
  updateState,
} from "../utils/chatApi";
import { ASSISTANT_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/utils/cookies";
import { GraphInterrupt } from "./GraphInterrupt";
import { useToast } from "@/hooks/use-toast";
import SkeletonMessage from "./SkeletonMessage";

interface ChatInterfaceProps {
  onLoadingChange?: (isLoading: boolean) => void;
  model: Model;
  streamMode: StreamMode;
  isInitializing: boolean;
  setIsInitializing: (value: boolean) => void;
  onMessagesChange?: (messages: Message[]) => void;
  onStreamModeChange?: (mode: StreamMode) => void;
  selectedAgentId?: string;
}

export default function ChatInterface({ 
  onLoadingChange, 
  model,
  streamMode,
  isInitializing,
  setIsInitializing,
  onMessagesChange,
  onStreamModeChange,
  selectedAgentId = "research_assistant"
}: ChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadState, setThreadState] = useState<ThreadState>();
  const [graphInterrupted, setGraphInterrupted] = useState(false);
  const [allowNullMessage, setAllowNullMessage] = useState(false);

  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      console.log("[ChatInterface] Starting chat initialization");
      try {
        let assistantId = getCookie(`${ASSISTANT_ID_COOKIE}_${selectedAgentId}`);
        console.log("[ChatInterface] Retrieved assistant ID from cookie:", assistantId);

        if (!assistantId) {
          console.log("[ChatInterface] No assistant ID found, creating new assistant");
          const assistant = await createAssistant(selectedAgentId);
          assistantId = assistant.assistant_id;
          console.log("[ChatInterface] New assistant created:", assistantId);
          setCookie(`${ASSISTANT_ID_COOKIE}_${selectedAgentId}`, assistantId);
        }

        console.log("[ChatInterface] Creating new thread");
        const thread = await createThread();
        console.log("[ChatInterface] Thread creation response:", thread);
        
        const threadId = thread?.thread_id;
        console.log("[ChatInterface] Setting thread ID:", threadId);
        
        if (!threadId) {
          throw new Error("Failed to get thread ID from response");
        }

        setThreadId(threadId);
        setAssistantId(assistantId);
        setUserId(uuidv4());
        console.log("[ChatInterface] Chat initialization complete", {
          threadId,
          assistantId,
          selectedAgentId
        });
      } catch (err) {
        console.error("[ChatInterface] Error initializing chat:", err);
        
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Unable to connect to the server. Please check your internet connection and try again.",
            duration: 5000,
          });
          return;
        }

        if (err instanceof Error) {
          toast({
            variant: "destructive",
            title: "Chat Initialization Failed",
            description: `Unable to start the chat: ${err.message}. Please try refreshing the page.`,
            duration: 5000,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Unexpected Error",
            description: "An unexpected error occurred while setting up the chat. Please try again later.",
            duration: 5000,
          });
        }

        if (!getCookie(`${ASSISTANT_ID_COOKIE}_${selectedAgentId}`)) {
          toast({
            variant: "destructive",
            title: "Assistant Creation Failed",
            description: "Failed to create a new assistant. This might affect chat functionality.",
            duration: 5000,
          });
        }
      } finally {
        setIsInitializing(false);
      }
    };

    // Reset state when agent changes
    console.log("[ChatInterface] Resetting state for agent change");
    setMessages([]);
    setThreadId(null);
    setAssistantId(null);
    setThreadState(undefined);
    setGraphInterrupted(false);
    setAllowNullMessage(false);
    
    initializeChat();
  }, [selectedAgentId, toast]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleInterruptResponse = async (response: string, node: string) => {
    if (!threadId || !assistantId) return;

    try {
      if (selectedAgentId === "research_assistant") {
        setIsLoading(true);  // Set loading state at the start

        // First update the state with the feedback
        const newState = node === "template_feedback_node" 
          ? { 
              template_feedback: response,
              topic: threadState?.values.topic || "",
              messages: [],
              progress_messages: []
            }
          : { 
              human_analyst_feedback: response,
              topic: threadState?.values.topic || "",
              messages: [],
              progress_messages: []
            };

        // Update state with the feedback
        await updateState(threadId, {
          newState,
          asNode: node
        });

        // Wait for state to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Reset states
        setGraphInterrupted(false);
        setAllowNullMessage(false);

        // Send a null message to continue the flow
        const messageResponse = await sendMessage({
          threadId,
          assistantId,
          message: null,
          messageId: uuidv4(),
          model,
          userId,
          streamMode,
          initialState: undefined
        });

        // Process the response
        for await (const chunk of messageResponse) {
          handleStreamEvent(chunk, setMessages, streamMode);
        }

        // Get and check the new state
        const currentState = await getThreadState(threadId);
        setThreadState(currentState);

        // Check if we need to show another interrupt
        if (currentState.next.includes("template_feedback_node") ||
            currentState.next.includes("human_feedback")) {
          setGraphInterrupted(true);
        }
      }
    } catch (err) {
      console.error("Error handling interrupt response:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your response. Please try again.",
      });
    } finally {
      setIsLoading(false);  // Reset loading state at the end
    }
  };

  const handleSendMessage = async (message: string | null) => {
    if (!threadId || !assistantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Chat is not properly initialized. Please try refreshing the page.",
      });
      return;
    }

    const messageId = uuidv4();
    if (message !== null) {
      setMessages((prev) => [...prev, { text: message, sender: "user", id: messageId }]);
    }

    try {
      setIsLoading(true);
      setThreadState(undefined);
      setGraphInterrupted(false);
      setAllowNullMessage(false);

      // For initial message, include full state based on agent type
      let initialState;
      if (message !== null) {
        if (selectedAgentId === "essay_writer") {
          initialState = {
            task: message,
            plan: "",
            draft: "",
            critique: "",
            content: [],
            revision_number: 0,
            max_revisions: 1
          };
        } else {
          // For research assistant
          initialState = {
            topic: message.trim(),
            messages: [{
              id: messageId,
              role: "human",
              content: message,
            }],
            progress_messages: [],
            template_feedback: "",
            human_analyst_feedback: "",
            analysts: [],
            sections: [],
            report_template: "",
            final_report: ""
          };
        }
      }

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

      if (selectedAgentId === "research_assistant" && 
          (currentState.next.includes("template_feedback_node") ||
           currentState.next.includes("human_feedback"))) {
        setGraphInterrupted(true);
      }
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
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div 
          ref={messageListRef}
          className="space-y-3 pb-3"
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
              {graphInterrupted && threadState && threadId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="transition-all duration-200 ease-in-out"
                >
                  <GraphInterrupt
                    setAllowNullMessage={setAllowNullMessage}
                    threadId={threadId}
                    state={threadState}
                    onContinue={handleSendMessage}
                    onInterruptResponse={handleInterruptResponse}
                  />
                </motion.div>
              )}
              {allowNullMessage && !graphInterrupted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center py-3"
                >
                  <button
                    onClick={() => handleSendMessage(null)}
                    disabled={isLoading}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          allowNullMessage={allowNullMessage}
          onStreamModeChange={onStreamModeChange}
          currentStreamMode={streamMode}
          selectedAgentId={selectedAgentId}
        />
      </div>
    </div>
  );
}