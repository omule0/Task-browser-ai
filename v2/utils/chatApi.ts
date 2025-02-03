import { StreamMode } from "@/components/Agentsettings";
import { ThreadState, ThreadStateData, ResearchState } from "../types";
import { Client } from "@langchain/langgraph-sdk";

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
): Promise<ThreadState> => {
  const client = createClient();
  return client.threads.getState(threadId);
};

export const updateState = async (
  threadId: string,
  fields: {
    newState: Partial<ResearchState>;
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
  streamMode: StreamMode;
  input?: Record<string, any>;
}) => {
  const client = createClient();

  let input: Partial<ThreadStateData> | null = null;
  if (params.input) {
    input = params.input;
  } else if (params.message !== null) {
    input = {
      messages: [
        {
          id: params.messageId,
          role: "human",
          content: params.message,
        },
      ],
      userId: params.userId,
      topic: params.message.trim(),
    };
  }

  const config = {
    configurable: {
      model_name: params.model,
    },
  };

  return client.runs.stream(params.threadId, params.assistantId, {
    input,
    config,
    streamMode: params.streamMode,
  });
};
