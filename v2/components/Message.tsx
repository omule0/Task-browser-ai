import Markdown from "react-markdown";
import ToolCall from "./ToolCall";
import { ToolCall as ToolCallType } from "../types";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Throws build errors if we try to import this normally
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });

interface MessageProps {
  text?: string;
  rawResponse?: Record<string, unknown>;
  sender: "ai" | "user";
  toolCalls?: ToolCallType[];
}

export default function Message({
  text,
  rawResponse,
  sender,
  toolCalls = [],
}: MessageProps) {
  const isBot = sender === "ai";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const messageContent = rawResponse ? (
    <ReactJson
      displayObjectSize={false}
      style={{ backgroundColor: "transparent" }}
      displayDataTypes={false}
      quotesOnKeys={false}
      enableClipboard={false}
      name={false}
      src={rawResponse}
      theme="tomorrow"
    />
  ) : (
    <>
      {toolCalls.length > 0 &&
        toolCalls.map((toolCall) => (
          <ToolCall key={toolCall.id} {...toolCall} />
        ))}
      {isBot ? <Markdown>{text}</Markdown> : text}
    </>
  );

  return (
    <div
      role="article"
      aria-label={`${isBot ? "AI" : "User"} message`}
      className={`flex ${
        isBot ? "justify-start" : "justify-end"
      } mb-4 relative transition-opacity duration-200 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {isBot && (
        <img
          src="/logo.jpeg"
          alt="AI Assistant"
          className="absolute left-0 top-4 w-8 h-8 rounded-full"
          style={{ transform: "translateX(-120%)" }}
        />
      )}
      <div
        className={`overflow-x-wrap break-words p-5 rounded-3xl ${
          isBot
            ? "w-full opacity-90 text-gray-200"
            : "mt-10 max-w-md text-gray-200 opacity-90"
        }`}
      >
        {messageContent}
      </div>
    </div>
  );
}
