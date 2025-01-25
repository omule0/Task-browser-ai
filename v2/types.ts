export type Message = {
  id: string;
  text?: string;
  rawResponse?: Record<string, any>;
  sender: string;
  toolCalls?: ToolCall[];
};

export interface ToolCall {
  id: string;
  name: string;
  args: string;
  result?: any;
}

export type Model = "gpt-4o-mini" | string; // Add other model options as needed

export interface Analyst {
  affiliation: string;
  name: string;
  role: string;
  description: string;
}

export interface ResearchState {
  topic: string;
  max_analysts: number;
  human_analyst_feedback?: string;
  template_feedback?: string;
  analysts?: Analyst[];
  sections?: string[];
  report_template?: string;
  final_report?: string;
}
