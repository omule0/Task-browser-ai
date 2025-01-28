import Markdown from "react-markdown";
import ToolCall from "./ToolCall";
import { ToolCall as ToolCallType } from "../types";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
    <div className="rounded-lg bg-muted/5 p-4 overflow-x-auto">
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
    </div>
  ) : (
    <>
      {toolCalls.length > 0 && (
        <div className="space-y-4 mb-4">
          {toolCalls.map((toolCall) => (
            <ToolCall key={toolCall.id} {...toolCall} />
          ))}
        </div>
      )}
      <div className={cn(
        "prose prose-sm max-w-none",
        "prose-headings:text-foreground prose-p:text-muted-foreground",
        "prose-strong:text-foreground prose-code:text-foreground",
        "prose-pre:bg-muted prose-pre:text-muted-foreground"
      )}>
        {isBot ? <Markdown>{text}</Markdown> : text}
      </div>
    </>
  );

  return (
    <div
      role="article"
      aria-label={`${isBot ? "AI" : "User"} message`}
      className={cn(
        "group relative flex w-full items-start gap-4 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <Card className={cn(
        "w-full p-4",
        isBot ? "bg-muted/50" : "bg-primary/5",
        "ring-1 ring-inset ring-black/5 dark:ring-white/5"
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-2">
            {isBot && toolCalls.length > 0 && (
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {toolCalls[0].name.split("_").map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(" ")}
              </div>
            )}
            <div className={cn(
              "text-sm",
              isBot ? "text-foreground" : "text-muted-foreground"
            )}>
              {messageContent}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
