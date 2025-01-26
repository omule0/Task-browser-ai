"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import SamplePrompts from "./SamplePrompts";
import Settings, { StreamMode } from "./Settings";
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

export default function ChatInterface() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const [streamMode, setStreamMode] = useState<StreamMode>("updates");
  const [userId, setUserId] = useState<string>("");
  const [systemInstructions, setSystemInstructions] = useState<string>("");
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
          console.log("Creating new assistant...");
          const assistant = await createAssistant("research_assistant");
          assistantId = assistant.assistant_id;
          setCookie(ASSISTANT_ID_COOKIE, assistantId);
          console.log("Created assistant:", assistantId);
        } else {
          console.log("Using existing assistant:", assistantId);
        }

        console.log("Creating new thread...");
        const { thread_id } = await createThread();
        console.log("Created thread:", thread_id);

        setThreadId(thread_id);
        setAssistantId(assistantId);
        setUserId(uuidv4());
      } catch (err) {
        console.error("Error initializing chat:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize chat. Please try refreshing the page.",
        });
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
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
      setMessages([
        ...messages,
        { text: message, sender: "user", id: messageId },
      ]);
    }

    try {
      setIsLoading(true);
      setThreadState(undefined);
      setGraphInterrupted(false);
      setAllowNullMessage(false);

      console.log("Sending message:", {
        threadId,
        assistantId,
        message,
        messageId,
        model,
        streamMode,
      });

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

      console.log("Got response stream");

      let eventCount = 0;
      for await (const chunk of response) {
        console.log(`Processing chunk ${++eventCount}:`, chunk);
        handleStreamEvent(chunk, setMessages, streamMode);
      }

      console.log("Stream completed");

      // Fetch the current state of the thread
      const currentState = await getThreadState(threadId);
      console.log("Current thread state:", currentState);
      
      setThreadState(currentState);
      
      // Check if we need human input
      if (currentState.next.includes("template_feedback_node") || 
          currentState.next.includes("human_feedback")) {
        console.log("Graph interrupted for human input");
        setGraphInterrupted(true);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error in message flow:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while processing your message. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="">
        <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
      <Settings
        onModelChange={setModel}
        onSystemInstructionsChange={setSystemInstructions}
        currentModel={model}
        currentSystemInstructions={systemInstructions}
        onStreamModeChange={setStreamMode}
        currentStreamMode={streamMode}
      />
      {isLoading && (
        <div className="">
          Processing your request...
        </div>
      )}
      {messages.length === 0 ? (
        <SamplePrompts onMessageSelect={handleSendMessage} />
      ) : (
        <div ref={messageListRef} className="">
          <MessageList messages={messages} />
          {graphInterrupted && threadState && threadId ? (
            <div className="">
              <GraphInterrupt
                setAllowNullMessage={setAllowNullMessage}
                threadId={threadId}
                state={threadState}
              />
            </div>
          ) : null}
          {allowNullMessage && (
            <div className="">
              <button
                onClick={() => handleSendMessage(null)}
                disabled={isLoading}
                className=""
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
