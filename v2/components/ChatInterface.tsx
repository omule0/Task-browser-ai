"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import SamplePrompts from "./SamplePrompts";
import AgentSettings, { StreamMode } from "./Agentsettings";
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
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  onLoadingChange?: (isLoading: boolean) => void;
  onOfflineChange?: (isOffline: boolean) => void;
}

export default function ChatInterface({ onLoadingChange, onOfflineChange }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const [streamMode, setStreamMode] = useState<StreamMode>("updates");
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [threadState, setThreadState] = useState<ThreadState>();
  const [graphInterrupted, setGraphInterrupted] = useState(false);
  const [allowNullMessage, setAllowNullMessage] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsOffline(false);
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
        setIsOffline(true);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize chat. Please try refreshing the page.",
        });
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
      setIsOffline(false);
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
    onOfflineChange?.(isOffline);
  }, [isOffline, onOfflineChange]);

  // Scroll handling
  const handleScroll = () => {
    if (!messageListRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
    setShowScrollButton(!isBottom);
    
    if (isBottom) {
      setHasNewMessage(false);
    }
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
      setHasNewMessage(false);
    }
  };

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
      return () => messageList.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;
      
      if (!isBottom) {
        setHasNewMessage(true);
      } else {
        scrollToBottom();
      }
    }
  }, [messages]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground"
        >
          Initializing research assistant...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-[100vh] max-w-5xl mx-auto relative">
      {/* Top Controls Row */}
      <div className="bg-background/80 backdrop-blur-sm  flex items-center  px-0 py-0">
          {/* Settings Panel on the left */}
          <div className="flex-shrink-0">
            <AgentSettings
              onModelChange={setModel}
              currentModel={model}
              onStreamModeChange={setStreamMode}
              currentStreamMode={streamMode}
              className="transition-all duration-200"
            />
          </div>

          {/* Input Area taking remaining space */}
          <div className="flex-1 min-w-0">
            <InputArea 
              onSendMessage={handleSendMessage} 
              disabled={isLoading}
              className="transition-all duration-200 transform"
            />
          </div>
        </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={messageListRef}
          className="h-full overflow-y-auto px-4 py-2 space-y-6 scroll-smooth"
        >
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SamplePrompts onMessageSelect={handleSendMessage} />
                </motion.div>
              ) : (
                <>
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
                      />
                    </motion.div>
                  )}
                  {allowNullMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-center py-4"
                    >
                      <button
                        onClick={() => handleSendMessage(null)}
                        disabled={isLoading}
                        className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      >
                        Continue Research
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToBottom}
              className={cn(
                "absolute bottom-6 right-6 p-2 rounded-full bg-primary shadow-lg",
                "hover:bg-primary/90 transition-all duration-200 transform hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                hasNewMessage && "animate-bounce"
              )}
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-5 h-5 text-white" />
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
