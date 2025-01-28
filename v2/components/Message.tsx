import Markdown from "react-markdown";
import ToolCall from "./ToolCall";
import { ToolCall as ToolCallType } from "../types";
import React, { useState, useEffect } from  "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { BotIcon} from "lucide-react"

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
      {isBot && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/25">
          <BotIcon className="h-6 w-6 rounded-full" />
        </div>
      )}
      <div className={cn(
        "flex min-h-[32px] w-full flex-col items-start gap-2",
        isBot ? "ml-0" : "ml-auto"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm",
          isBot ? "bg-muted/50" : "bg-primary text-primary-foreground",
          "ring-1 ring-inset ring-black/5 dark:ring-white/5"
        )}>
          {messageContent}
        </div>
      </div>
    </div>
  );
}
