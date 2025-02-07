import { Client } from "@langchain/langgraph-sdk";

// Initialize the LangGraph client
export const langGraphClient = new Client({ 
  apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || "http://localhost:8000" 
});

// Function to create a new thread for a specific assistant
export async function createAssistantThread(assistantId: string) {
  try {
    const thread = await langGraphClient.threads.create();
    return {
      threadId: thread.id,
      assistantId,
    };
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

// Function to send a message to a thread
export async function sendMessage(threadId: string, content: string) {
  try {
    const message = await langGraphClient.threads.messages.create(threadId, {
      content,
      role: "user",
    });
    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Function to get messages from a thread
export async function getMessages(threadId: string) {
  try {
    const messages = await langGraphClient.threads.messages.list(threadId);
    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
} 