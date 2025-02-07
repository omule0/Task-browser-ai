import { StreamMode } from "@/components/Agentsettings";
import { ThreadState, ThreadStateData, ResearchState } from "../types";
import { Client, Assistant, Thread } from "@langchain/langgraph-sdk";

const createClient = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
  console.log("[ChatAPI] Creating client with API URL:", apiUrl);
  return new Client({
    apiUrl,
  });
};

export const createAssistant = async (graphId: string) => {
  console.log("[ChatAPI] Creating assistant:", { graphId });
  try {
    const client = createClient();
    const result = await client.assistants.create({ graphId });
    console.log("[ChatAPI] Assistant created:", result);
    return result;
  } catch (error) {
    console.error("[ChatAPI] Error creating assistant:", error);
    throw error;
  }
};

export const createThread = async () => {
  console.log("[ChatAPI] Creating new thread");
  try {
    const client = createClient();
    const result = await client.threads.create();
    // Log the entire result to see what we're getting back
    console.log("[ChatAPI] Thread creation response:", JSON.stringify(result, null, 2));
    
    // Safely access potential thread identifier
    const threadId = (result as any)?.thread_id || (result as any)?.id;
    console.log("[ChatAPI] Thread created with ID:", threadId);
    
    return result;
  } catch (error) {
    console.error("[ChatAPI] Error creating thread:", error);
    throw error;
  }
};

export const getThreadState = async (
  threadId: string
): Promise<ThreadState> => {
  console.log("[ChatAPI] Getting thread state:", { threadId });
  try {
    const client = createClient();
    const result = await client.threads.getState(threadId);
    console.log("[ChatAPI] Raw thread state:", JSON.stringify(result, null, 2));
    return result as ThreadState;
  } catch (error) {
    console.error("[ChatAPI] Error getting thread state:", error);
    throw error;
  }
};

export const updateState = async (
  threadId: string,
  fields: {
    newState: Partial<ResearchState>;
    asNode?: string;
  }
) => {
  console.log("[ChatAPI] Updating thread state:", { threadId, fields });
  const client = createClient();
  const result = await client.threads.updateState(threadId, {
    values: fields.newState,
    asNode: fields.asNode,
  });
  console.log("[ChatAPI] State updated:", { result });
  return result;
};

export const sendMessage = async (params: {
  threadId: string;
  assistantId: string;
  messageId: string;
  message: string | null;
  model: string;
  userId: string;
  streamMode: StreamMode;
}) => {
  console.log("[ChatAPI] Sending message:", { 
    threadId: params.threadId,
    assistantId: params.assistantId,
    messageId: params.messageId,
    model: params.model,
    streamMode: params.streamMode
  });

  const client = createClient();

  let input: Partial<ThreadStateData> | null = null;
  if (params.message !== null ) {
    input =  {
      messages: [
        {
          id: params.messageId,
          role: "human",
          content: params.message,
        },
      ],
      userId: params.userId,
      topic: params.message?.trim(),
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