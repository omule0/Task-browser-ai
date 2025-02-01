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
}

export default function ChatInterface({ 
  onLoadingChange, 
  model,
  streamMode,
  isInitializing,
  setIsInitializing,
  onMessagesChange,
  onStreamModeChange
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
      try {
        let assistantId = getCookie(ASSISTANT_ID_COOKIE);
        if (!assistantId) {
          const assistant = await createAssistant("research_assistant");
          assistantId = assistant.assistant_id;
          setCookie(ASSISTANT_ID_COOKIE, assistantId);
        }

        const { thread_id } = await createThread();
        setThreadId(thread_id);
        setAssistantId(assistantId);
        setUserId(uuidv4());
      } catch (err) {
        console.error("Error initializing chat:", err);
        
        // Handle network errors specifically
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          toast({
            variant: "destructive",
            title: "Network Error",
            description: "Unable to connect to the server. Please check your internet connection and try again.",
            duration: 5000,
          });
          return;
        }

        // Handle other known errors
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

        // Show an additional toast if the assistant creation specifically failed
        if (!getCookie(ASSISTANT_ID_COOKIE)) {
          toast({
            variant: "destructive",
            title: "Assistant Creation Failed",
            description: "Failed to create a new research assistant. This might affect chat functionality.",
            duration: 5000,
          });
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [toast]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

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

      const response = await sendMessage({
        threadId,
        assistantId,
        message,
        messageId,
        model,
        userId,
        streamMode,
      });

      for await (const chunk of response) {
        handleStreamEvent(chunk, setMessages, streamMode);
      }

      const currentState = await getThreadState(threadId);
      setThreadState(currentState);

      if (
        currentState.next.includes("template_feedback_node") ||
        currentState.next.includes("human_feedback")
      ) {
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
      {/* Main Chat Area */}
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
                    Continue Research
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="relative">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          allowNullMessage={allowNullMessage}
          onStreamModeChange={onStreamModeChange}
          currentStreamMode={streamMode}
        />
      </div>
    </div>
  );
}
