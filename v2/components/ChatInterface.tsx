"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
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
  const [systemInstructions, setSystemInstructions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [threadState, setThreadState] = useState<ThreadState>();
  const [graphInterrupted, setGraphInterrupted] = useState(false);
  const [allowNullMessage, setAllowNullMessage] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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
        systemInstructions,
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

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Initializing research assistant...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full min-h-[80vh] max-w-7xl mx-auto">
      {/* Input Area at the top */}
      <div className="bg-background border-b pb-4">
        <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>

      {/* Settings Panel */}
      <div className="bg-background border-b">
        <AgentSettings
          onModelChange={setModel}
          onSystemInstructionsChange={setSystemInstructions}
          currentModel={model}
          currentSystemInstructions={systemInstructions}
          onStreamModeChange={setStreamMode}
          currentStreamMode={streamMode}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={messageListRef}
          className="h-full overflow-y-auto px-4 py-6 space-y-6"
        >
          {messages.length === 0 ? (
            <SamplePrompts onMessageSelect={handleSendMessage} />
          ) : (
            <>
              <MessageList messages={messages} />
              {isLoading && <SkeletonMessage />}
              {graphInterrupted && threadState && threadId && (
                <div className="transition-all duration-200 ease-in-out">
                  <GraphInterrupt
                    setAllowNullMessage={setAllowNullMessage}
                    threadId={threadId}
                    state={threadState}
                  />
                </div>
              )}
              {allowNullMessage && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => handleSendMessage(null)}
                    disabled={isLoading}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Continue Research
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
