"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import HomeComponent from "./HomeComponent";
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

export default function ChatInterface() {
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
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError("Failed to initialize chat. Please try refreshing the page.");
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
      setError("Chat is not properly initialized. Please try refreshing the page.");
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
      setError(null);

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
      setError("An error occurred while processing your message. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-12rem)] bg-background/95 rounded-lg shadow-md">
      <Settings
        onModelChange={setModel}
        onSystemInstructionsChange={setSystemInstructions}
        currentModel={model}
        currentSystemInstructions={systemInstructions}
        onStreamModeChange={setStreamMode}
        currentStreamMode={streamMode}
      />
      {error && (
        <div className="bg-red-500 text-white p-4 text-center">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="bg-blue-500 text-white p-2 text-center">
          Processing your request...
        </div>
      )}
      {messages.length === 0 ? (
        <HomeComponent onMessageSelect={handleSendMessage} />
      ) : (
        <div ref={messageListRef} className="flex-1 overflow-y-auto">
          <MessageList messages={messages} />
          {graphInterrupted && threadState && threadId ? (
            <div className="flex items-center justify-start w-2/3 mx-auto">
              <GraphInterrupt
                setAllowNullMessage={setAllowNullMessage}
                threadId={threadId}
                state={threadState}
              />
            </div>
          ) : null}
          {allowNullMessage && (
            <div className="flex flex-col w-2/3 mx-auto pb-4">
              <button
                onClick={() => handleSendMessage(null)}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 max-w-[400px] mx-auto"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}
      <div className="sticky bottom-0 left-0 right-0 bg-background/95 border-t border-border p-4">
        <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
