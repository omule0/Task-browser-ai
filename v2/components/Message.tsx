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

interface Analyst {
  affiliation: string;
  name: string;
  role: string;
  description: string;
}

const commonProseStyles = [
  "prose prose-sm dark:prose-invert max-w-none",
  "prose-headings:text-foreground prose-p:text-muted-foreground",
  "prose-strong:text-foreground prose-code:text-foreground",
  "[&>*:first-child]:mt-0",
  "[&>*:last-child]:mb-0",
] as const;

const templateProseStyles = [
  ...commonProseStyles,
  "prose-h1:text-xl prose-h1:font-semibold prose-h1:mb-4",
  "prose-h2:text-base prose-h2:font-medium prose-h2:mt-4 prose-h2:mb-2",
  "prose-h3:text-sm prose-h3:font-medium prose-h3:mt-3 prose-h3:mb-1.5",
  "prose-ul:my-0.5 prose-ul:pl-4",
  "prose-li:my-0.5 prose-li:leading-normal",
  "text-sm leading-normal"
] as const;

const finalReportStyles = [
  ...commonProseStyles,
  "prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-6",
  "prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4",
  "prose-h2:pb-2 prose-h2:border-b prose-h2:border-border",
  "prose-h3:text-base prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3",
  "prose-p:text-sm prose-p:my-2 prose-p:leading-relaxed",
  "prose-ul:my-2 prose-ul:pl-6",
  "prose-li:my-0.5",
  "prose-a:text-primary hover:prose-a:text-primary/80",
  "break-words overflow-x-auto"
] as const;

const interviewSectionStyles = [
  ...commonProseStyles,
  "prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3",
  "prose-h3:text-base prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2",
  "prose-p:text-sm prose-p:my-2 prose-p:leading-relaxed",
  "prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4",
  "prose-li:my-0.5",
  "prose-a:text-primary hover:prose-a:text-primary/80",
  "[&_h3:last-of-type]:border-t [&_h3:last-of-type]:pt-4 [&_h3:last-of-type]:mt-6",
  "[&_h3:last-of-type+p]:mt-2 [&_h3:last-of-type~p]:my-1 [&_h3:last-of-type~p]:text-xs",
  "break-words overflow-x-auto"
] as const;

const ReportTemplate = ({ template }: { template: string }) => (
  <div className={cn(...templateProseStyles)}>
    <Markdown>{template}</Markdown>
  </div>
);

const FinalReport = ({ report }: { report: string }) => (
  <div className={cn("overflow-x-hidden", ...finalReportStyles)}>
    <Markdown className="max-w-full">{report}</Markdown>
  </div>
);

const InterviewSection = ({ sections }: { sections: string[] }) => (
  <div className={cn("overflow-x-hidden", ...interviewSectionStyles)}>
    {sections.map((section, index) => (
      <Markdown key={index} className="max-w-full">{section}</Markdown>
    ))}
  </div>
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

  const isInterruptMessage = (data: Record<string, unknown>): boolean => {
    return '__interrupt__' in data;
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Hide interrupt messages completely
  if (rawResponse && isInterruptMessage(rawResponse)) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={cn(
        "w-full p-4",
        "bg-background"
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
    // Hide interrupt messages
    if (isInterruptMessage(data)) {
      return null;
    }

    // Handle final report
    if (isFinalReport(data)) {
      const report = (data.write_complete_report as Record<string, unknown>).final_report as string;
      return <FinalReport report={report} />;
    }

    // Handle interview sections
    if (isInterviewSection(data)) {
      const sections = (data.conduct_interview as Record<string, unknown>).sections as string[];
      return <InterviewSection sections={sections} />;
    }

    // Handle report templates
    if (isReportTemplate(data)) {
      const template = (data.generate_template as Record<string, unknown>).report_template as string;
      return <ReportTemplate template={template} />;
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
    <div>
      <div className="mb-2">
        <Badge variant="secondary">
          {isAnalystResponse(rawResponse) ? 'AI Analysts' : 
           isReportTemplate(rawResponse) ? 'Report Template' : 
           isInterviewSection(rawResponse) ? 'Research Summary' :
           isFinalReport(rawResponse) ? 'Final Report' :
           'Response'}
        </Badge>
      </div>
      <div className={cn(
        "rounded-lg bg-muted/5 p-4",
        (isReportTemplate(rawResponse) || isAnalystResponse(rawResponse) || 
         isInterviewSection(rawResponse) || isFinalReport(rawResponse))
          ? "prose prose-sm dark:prose-invert max-w-none" 
          : ""
      )}>
        {renderJsonContent(rawResponse)}
      </div>
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
                <pre {...props} className="p-4">{children}</pre>
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
          "bg-background",
          isBot ? "bg-white" : "bg-blue-50",
          "ring-1 ring-inset ring-black/5 dark:ring-white/5",
          "hover:ring-primary/10 dark:hover:ring-primary/10"
        )}
      >
        <div className="flex items-start gap-3">
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
          {messageContent}
        </div>
      </Card>
    </div>
  );
}
