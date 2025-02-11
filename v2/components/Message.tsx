'use client';

import Markdown from "react-markdown";
import ToolCall from "./ToolCall";
import { ToolCall as ToolCallType } from "../types";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MessageProps {
  text?: string;
  rawResponse?: Record<string, unknown>;
  sender: "ai" | "user";
  toolCalls?: ToolCallType[];
  isLoading?: boolean;
}

const proseStyles = [
  "prose prose-sm dark:prose-invert max-w-none",
  "prose-headings:text-foreground prose-p:text-muted-foreground",
  "prose-strong:text-foreground prose-code:text-foreground",
  "prose-pre:bg-muted/10 prose-pre:text-muted-foreground",
  "prose-pre:rounded-lg",
  "[&>*:first-child]:mt-0",
  "[&>*:last-child]:mb-0",
] as const;

const CustomLink = ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
    >
    {children}
    </a>
);

export default function Message({
  text,
  rawResponse,
  sender,
  toolCalls = [],
  isLoading = false
}: MessageProps) {
  const isBot = sender === "ai";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="w-full p-4 bg-background">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {isBot ? <Bot className="h-6 w-6 text-muted-foreground" /> : <UserCircle className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  // Render message content
  const messageContent = rawResponse ? (
    <div className="space-y-4">
      {/* Show response type badge if available */}
      {Object.keys(rawResponse)[0] && (
        <Badge variant="secondary">
          {Object.keys(rawResponse)[0].split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </Badge>
      )}
      
      {/* Render response content */}
      <div className={cn("rounded-lg bg-muted/5 p-4", ...proseStyles)}>
        <Markdown
          components={{
            a: CustomLink,
            pre: ({ children }) => <pre className="p-4">{children}</pre>,
            code: (props) => <code {...props} className="bg-muted/30 rounded px-1.5 py-0.5" />
          }}
        >
          {typeof rawResponse === 'string' 
            ? rawResponse 
            : JSON.stringify(rawResponse, null, 2)}
        </Markdown>
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Show tool calls if any */}
      {toolCalls.length > 0 && (
        <div className="space-y-4">
          {toolCalls.map((toolCall) => (
            <ToolCall key={toolCall.id} {...toolCall} />
          ))}
        </div>
      )}
      
      {/* Show message text */}
      <div className={cn(...proseStyles)}>
          <Markdown 
            components={{
            pre: ({ children }) => <pre className="p-4">{children}</pre>,
            code: (props) => <code {...props} className="bg-muted/30 rounded px-1.5 py-0.5" />
            }}
          >
          {text || ''}
          </Markdown>
      </div>
    </div>
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
      <Card 
        className={cn(
          "w-full p-4",
          isBot ? "bg-white" : "bg-blue-50",
          "ring-1 ring-inset ring-black/5 dark:ring-white/5",
          "hover:ring-primary/10 dark:hover:ring-primary/10"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0">
            {isBot ? (
              <div className="bg-blue-500 w-full h-full rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
            ) : (
              <div className="bg-green-500 w-full h-full rounded-full flex items-center justify-center">
                <UserCircle className="h-5 w-5" />
              </div>
            )}
          </div>
          
          {/* Message content */}
          {messageContent}
        </div>
      </Card>
    </div>
  );
}