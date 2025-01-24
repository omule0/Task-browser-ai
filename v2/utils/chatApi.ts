import { StreamMode } from "@/components/Settings";
import { ThreadState, Client } from "@langchain/langgraph-sdk";

function parseResearchQuery(message: string): { topic: string; max_analysts: number } {
  // Default values
  let max_analysts = 3;
  let topic = message;

  // Try to extract number of analysts from the message
  const analystsMatch = message.match(/with\s+(\d+)\s+analysts?/i);
  if (analystsMatch) {
    max_analysts = parseInt(analystsMatch[1]);
    // Remove the analysts part from the topic
    topic = message.replace(/with\s+\d+\s+analysts?/i, '').trim();
  }

  // Clean up the topic
  topic = topic.replace(/^(research|analyze|study)\s+/i, '').trim();
  
  return { topic, max_analysts };
}

const createClient = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
  return new Client({
    apiUrl,
  });
};

export const createAssistant = async (graphId: string) => {
  const client = createClient();
  return client.assistants.create({ graphId });
};

export const createThread = async () => {
  const client = createClient();
  return client.threads.create();
};

export const getThreadState = async (
  threadId: string
): Promise<ThreadState<Record<string, any>>> => {
  const client = createClient();
  return client.threads.getState(threadId);
};

export const updateState = async (
  threadId: string,
  fields: {
    newState: Record<string, any>;
    asNode?: string;
  }
) => {
  const client = createClient();
  return client.threads.updateState(threadId, {
    values: fields.newState,
    asNode: fields.asNode,
  });
};

export const sendMessage = async (params: {
  threadId: string;
  assistantId: string;
  messageId: string;
  message: string | null;
  model: string;
  userId: string;
  systemInstructions: string;
  streamMode: StreamMode;
}) => {
  const client = createClient();

  let input: Record<string, any> | null = null;
  if (params.message !== null) {
    const { topic, max_analysts } = parseResearchQuery(params.message);
    
    // Format input for LangGraph research assistant
    input = {
      topic,
      max_analysts,
      human_analyst_feedback: "",
      template_feedback: "",
      analysts: [],
      sections: [],
      report_template: "",
      final_report: "",
      messages: [
        {
          id: params.messageId,
          role: "human",
          content: params.message,
        },
      ],
    };

    console.log("Formatted input for LangGraph:", input);
  }

  const config = {
    configurable: {
      model_name: params.model,
      system_instructions: params.systemInstructions,
    },
  };

  return client.runs.stream(params.threadId, params.assistantId, {
    input,
    config,
    streamMode: params.streamMode,
  });
};
