'use client';

import Markdown from "react-markdown";
import ToolCall from "./ToolCall";
import { ToolCall as ToolCallType } from "../types";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle, Bot, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Throws build errors if we try to import this normally
const ReactJson = dynamic(() => import("react-json-view"), { 
  ssr: false,
  loading: () => <Skeleton className="h-20 w-full" />
});

interface MessageProps {
  text?: string;
  rawResponse?: Record<string, unknown>;
  sender: "ai" | "user";
  toolCalls?: ToolCallType[];
  isLoading?: boolean;
}

interface Analyst {
  affiliation: string;
  name: string;
  role: string;
  description: string;
}

export default function Message({
  text,
  rawResponse,
  sender,
  toolCalls = [],
  isLoading = false
}: MessageProps) {
  const isBot = sender === "ai";
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy text to clipboard");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <Card className={cn(
        "w-full p-4",
        isBot ? "bg-muted/50" : "bg-primary/5"
      )}>
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

  const extractProgressMessages = (data: Record<string, unknown>): string[] => {
    const messages: string[] = [];
    
    const traverse = (obj: unknown) => {
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (typeof item === 'string') {
            messages.push(item);
          } else {
            traverse(item);
          }
        });
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(value => {
          if (value && typeof value === 'object') {
            traverse(value);
          } else if (typeof value === 'string') {
            messages.push(value);
          }
        });
      }
    };

    traverse(data);
    return messages;
  };

  const isReportTemplate = (data: Record<string, unknown>): boolean => {
    return (
      'generate_template' in data && 
      typeof data.generate_template === 'object' && 
      data.generate_template !== null &&
      'report_template' in (data.generate_template as Record<string, unknown>) &&
      typeof (data.generate_template as Record<string, unknown>).report_template === 'string'
    );
  };

  const isAnalystResponse = (data: Record<string, unknown>): boolean => {
    return (
      'create_analysts' in data && 
      typeof data.create_analysts === 'object' && 
      data.create_analysts !== null &&
      'analysts' in (data.create_analysts as Record<string, unknown>) &&
      Array.isArray((data.create_analysts as Record<string, unknown>).analysts)
    );
  };

  const isInterviewSection = (data: Record<string, unknown>): boolean => {
    return (
      'conduct_interview' in data && 
      typeof data.conduct_interview === 'object' && 
      data.conduct_interview !== null &&
      'sections' in (data.conduct_interview as Record<string, unknown>) &&
      Array.isArray((data.conduct_interview as Record<string, unknown>).sections)
    );
  };

  const isFinalReport = (data: Record<string, unknown>): boolean => {
    return (
      'write_complete_report' in data && 
      typeof data.write_complete_report === 'object' && 
      data.write_complete_report !== null &&
      'final_report' in (data.write_complete_report as Record<string, unknown>) &&
      typeof (data.write_complete_report as Record<string, unknown>).final_report === 'string'
    );
  };

  const renderAnalyst = (analyst: Analyst) => (
    <div className="space-y-1.5 border-l-2 border-primary/10 pl-3">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-foreground">{analyst.name}</h3>
        <span className="text-xs bg-primary/10 text-primary-foreground px-2 py-0.5 rounded-full">
          {analyst.role}
        </span>
      </div>
      <div className="text-xs text-muted-foreground font-medium">
        {analyst.affiliation}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {analyst.description}
      </p>
    </div>
  );

  const renderJsonContent = (data: Record<string, unknown>) => {
    // Handle final report
    if (isFinalReport(data)) {
      const report = (data.write_complete_report as Record<string, unknown>).final_report as string;
      return (
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          // Main title
          "prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-0",
          // Section headers
          "prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4",
          "prose-h2:pb-2 prose-h2:border-b prose-h2:border-border",
          // Subsection headers
          "prose-h3:text-base prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3",
          // Paragraphs and content
          "prose-p:text-sm prose-p:text-muted-foreground prose-p:my-2 prose-p:leading-relaxed",
          // Lists
          "prose-ul:my-2 prose-ul:pl-6",
          "prose-li:my-0.5 prose-li:text-muted-foreground",
          // Title page items
          "[&_h2:first-of-type+ul]:list-none [&_h2:first-of-type+ul]:pl-0",
          "[&_h2:first-of-type+ul>li]:my-1",
          // Table of contents
          "[&_h2:nth-of-type(3)+ol]:list-decimal [&_h2:nth-of-type(3)+ol]:pl-6",
          "[&_h2:nth-of-type(3)+ol>li]:my-0.5 [&_h2:nth-of-type(3)+ol>li]:text-muted-foreground",
          // References
          "[&_h2:nth-last-of-type(2)]:mt-8 [&_h2:nth-last-of-type(2)]:border-t [&_h2:nth-last-of-type(2)]:pt-6",
          "[&_h2:nth-last-of-type(2)+ol]:list-none [&_h2:nth-last-of-type(2)+ol]:pl-0",
          "[&_h2:nth-last-of-type(2)+ol>li]:my-1 [&_h2:nth-last-of-type(2)+ol>li]:text-xs",
          // Appendices
          "[&_h2:last-of-type+ul]:list-none [&_h2:last-of-type+ul]:pl-0",
          "[&_h2:last-of-type+ul>li]:my-1 [&_h2:last-of-type+ul>li]:text-sm",
          // Links
          "prose-a:text-primary hover:prose-a:text-primary/80",
          // Strong text
          "prose-strong:font-medium prose-strong:text-muted-foreground"
        )}>
          <Markdown>{report}</Markdown>
        </div>
      );
    }

    // Handle interview sections
    if (isInterviewSection(data)) {
      const sections = (data.conduct_interview as Record<string, unknown>).sections as string[];
      return (
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          // Headers
          "prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3",
          "prose-h3:text-base prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2",
          // Paragraphs
          "prose-p:text-sm prose-p:text-muted-foreground prose-p:my-2 prose-p:leading-relaxed",
          // Lists
          "prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4",
          "prose-li:my-0.5",
          // Links
          "prose-a:text-primary hover:prose-a:text-primary/80",
          // First element spacing
          "[&>*:first-child]:mt-0",
          // Sources section
          "[&_h3:last-of-type]:border-t [&_h3:last-of-type]:pt-4 [&_h3:last-of-type]:mt-6 [&_h3:last-of-type]:border-border",
          // Source links
          "[&_h3:last-of-type+p]:mt-2 [&_h3:last-of-type~p]:my-1 [&_h3:last-of-type~p]:text-xs"
        )}>
          {sections.map((section, index) => (
            <Markdown key={index}>{section}</Markdown>
          ))}
        </div>
      );
    }

    // Handle report templates
    if (isReportTemplate(data)) {
      const template = (data.generate_template as Record<string, unknown>).report_template as string;
      return (
        <div className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          // Main title
          "prose-h1:text-xl prose-h1:font-semibold prose-h1:mt-0 prose-h1:mb-4",
          // Section headers
          "prose-h2:text-base prose-h2:font-medium prose-h2:mt-4 prose-h2:mb-2",
          // Subsection headers
          "prose-h3:text-sm prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-1.5",
          // Lists and content
          "prose-ul:my-0.5 prose-ul:pl-4",
          "prose-li:my-0.5 prose-li:leading-normal",
          // Description text
          "[&_li>strong]:text-xs [&_li>strong]:font-normal [&_li>strong]:text-muted-foreground [&_li>strong]:block [&_li>strong]:mt-0.5",
          // Spacing adjustments
          "[&>*:first-child]:mt-0",
          "[&>*:last-child]:mb-0",
          // Nested lists
          "[&_ul_ul]:mt-0 [&_ul_ul]:mb-0 [&_ul_ul]:ml-3",
          // List markers
          "prose-li:marker:text-muted-foreground/70",
          // Overall text
          "text-sm leading-normal"
        )}>
          <Markdown>{template}</Markdown>
        </div>
      );
    }

    // Handle analysts
    if (isAnalystResponse(data)) {
      const analysts = (data.create_analysts as Record<string, unknown>).analysts as Analyst[];
      return (
        <div className="space-y-6">
          {analysts.map((analyst, index) => (
            <div key={index}>
              {renderAnalyst(analyst)}
            </div>
          ))}
        </div>
      );
    }

    // Handle progress messages
    const progressMessages = extractProgressMessages(data);
    if (progressMessages.length > 0) {
      return (
        <div className="space-y-2">
          {progressMessages.map((message, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              {message}
            </div>
          ))}
        </div>
      );
    }

    // Handle other JSON content
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value], index) => (
          <div key={index} className="flex items-start gap-2">
            <Badge variant="outline" className="shrink-0">{key}</Badge>
            <span className="text-sm text-muted-foreground break-all">
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const messageContent = rawResponse ? (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary">
          {isAnalystResponse(rawResponse) ? 'AI Analysts' : 
           isReportTemplate(rawResponse) ? 'Report Template' : 
           isInterviewSection(rawResponse) ? 'Research Summary' :
           isFinalReport(rawResponse) ? 'Final Report' :
           'Response'}
        </Badge>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(JSON.stringify(rawResponse, null, 2))}
            className="h-8 px-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <div className={cn(
        "rounded-lg bg-muted/5 p-4",
        (isReportTemplate(rawResponse) || isAnalystResponse(rawResponse) || 
         isInterviewSection(rawResponse) || isFinalReport(rawResponse)) && !isExpanded 
          ? "prose prose-sm dark:prose-invert max-w-none" 
          : ""
      )}>
        {!isExpanded ? (
          renderJsonContent(rawResponse)
        ) : (
          <CollapsibleContent>
            <div className="pt-2">
              <ReactJson
                displayObjectSize={false}
                style={{ backgroundColor: "transparent" }}
                displayDataTypes={false}
                quotesOnKeys={false}
                enableClipboard={false}
                name={false}
                src={rawResponse}
                theme="tomorrow"
                collapsed={2}
              />
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  ) : (
    <>
      {toolCalls.length > 0 && (
        <div className="space-y-4 mb-4">
          {toolCalls.map((toolCall) => (
            <ToolCall key={toolCall.id} {...toolCall} />
          ))}
        </div>
      )}
      <div 
        className={cn(
          "prose prose-sm max-w-none",
          "prose-headings:text-foreground prose-p:text-muted-foreground",
          "prose-strong:text-foreground prose-code:text-foreground",
          "prose-pre:bg-muted/10 prose-pre:text-muted-foreground",
          "prose-pre:rounded-lg"
        )}
        role="article"
      >
        {isBot ? (
          <Markdown 
            components={{
              pre: ({ children, ...props }) => (
                <div className="relative">
                  <pre {...props} className="p-4">{children}</pre>
                  <Button
                    onClick={() => {
                      const codeContent = children?.toString() || "";
                      handleCopy(codeContent);
                    }}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 px-2"
                    aria-label="Copy code"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              ),
              code: (props) => (
                <code {...props} className="bg-muted/30 rounded px-1.5 py-0.5" />
              )
            }}
          >
            {text}
          </Markdown>
        ) : text}
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
      <Card 
        className={cn(
          "w-full p-4",
          isBot ? "bg-muted/50" : "bg-primary/5",
          "ring-1 ring-inset ring-black/5 dark:ring-white/5",
          "hover:ring-primary/10 dark:hover:ring-primary/10"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            {isBot ? <Bot className="h-6 w-6 text-muted-foreground" /> : <UserCircle className="h-6 w-6 text-muted-foreground" />}
          </div>
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
      {error && (
        <div 
          role="alert"
          className="absolute top-0 right-0 mt-2 mr-2 p-2 bg-destructive text-destructive-foreground rounded-md text-sm"
        >
          {error}
        </div>
      )}
    </div>
  );
}
