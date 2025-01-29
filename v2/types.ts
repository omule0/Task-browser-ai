import { ThreadState as LangChainThreadState } from "@langchain/langgraph-sdk";

export type Message = {
  id: string;
  text: string;
  rawResponse?: Record<string, unknown>;
  sender: string;
  toolCalls?: ToolCall[];
};

export interface ToolCall {
  id: string;
  name: string;
  args: string;
  result?: string;
}

export type Model = string;

export type StreamMode = "updates" | "messages" | "values" | "events";

export interface Analyst {
  affiliation: string;
  name: string;
  role: string;
  description: string;
}

export interface ResearchState {
  topic: string;
  human_analyst_feedback: string;
  template_feedback: string;
  analysts: Analyst[];
  sections?: string[];
  report_template: string;
  final_report?: string;
}

export interface ThreadStateData {
  messages: Array<{
    id: string;
    role: string;
    content: string;
  }>;
  userId?: string;
  topic?: string;
  human_analyst_feedback?: string;
  template_feedback?: string;
  analysts?: Analyst[];
  sections?: string[];
  report_template?: string;
  final_report?: string;
  [key: string]: unknown;
}

export type ThreadState = LangChainThreadState<ThreadStateData>;
