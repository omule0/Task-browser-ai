import { StreamMode } from "@/components/Agentsettings";
import { Message, ToolCall, ResearchState } from "../types";

interface StreamEvent {
  event: string;
  data: unknown;
}

type MessageDataItem = {
  id: string;
  type: string;
  content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
  artifact?: string;
};

interface MessageEvent extends StreamEvent {
  event: "messages/partial" | "messages/complete";
  data: MessageDataItem[];
}

interface EventData {
  run_id: string;
  event: string;
  name: string;
  metadata: Record<string, unknown>;
}

interface EventEvent extends StreamEvent {
  event: "events";
  data: EventData;
}

interface UpdateData extends Partial<ResearchState> {
  run_id: string;
  step: string;
  next: string[];
  values: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

interface UpdateEvent extends StreamEvent {
  event: "updates";
  data: UpdateData;
}

interface ValueData extends Partial<ResearchState> {
  run_id: string;
}

interface ValueEvent extends StreamEvent {
  event: "values";
  data: ValueData;
}

export const handleStreamEvent = (
  event: StreamEvent,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  streamMode: StreamMode
) => {
  if (streamMode === "messages") {
    handleStreamMessageEvent(event as MessageEvent, setMessages);
  } else if (streamMode === "events") {
    handleStreamEventEvent(event as EventEvent, setMessages);
  } else if (streamMode === "updates") {
    handleStreamUpdatesEvent(event as UpdateEvent, setMessages);
  } else if (streamMode === "values") {
    handleStreamValuesEvent(event as ValueEvent, setMessages);
  }
};

const handleStreamMessageEvent = (
  event: MessageEvent,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event === "messages/partial") {
    event.data.forEach((dataItem) => {
      const toolCalls = dataItem.tool_calls;
      
      setMessages((prevMessages) => {
        // Try to find an existing message with the same ID or content that starts with the new content
        const existingMessageIndex = prevMessages.findIndex(
          (msg) => 
            msg.id === dataItem.id || 
            (dataItem.content && msg.text && dataItem.content.startsWith(msg.text))
        );

        if (existingMessageIndex !== -1) {
          // Update existing message
          const updatedMessages = [...prevMessages];
          const existingMessage = updatedMessages[existingMessageIndex];
          
          updatedMessages[existingMessageIndex] = {
            ...existingMessage,
            id: dataItem.id || existingMessage.id || `msg_${Date.now()}`,
            text: dataItem.content || existingMessage.text || "",
            toolCalls: toolCalls ? [
              ...(existingMessage.toolCalls || []),
              ...toolCalls.filter(
                (newTc) => !existingMessage.toolCalls?.some(
                  (existingTc) => existingTc.id === newTc.id
                )
              ),
            ] : existingMessage.toolCalls
          };
          
          return updatedMessages;
        } else {
          // Create new message if no existing message found
          const newMessage: Message = {
            id: dataItem.id || `msg_${Date.now()}`,
            text: dataItem.content || "",
            sender: dataItem.type as "ai" | "user",
            toolCalls: toolCalls || []
          };
          return [...prevMessages, newMessage];
        }
      });
    });
  } else if (event.event === "messages/complete") {
    const dataItem = event.data[event.data.length - 1];
    if (dataItem.type === "tool") {
      // Handle tool call completion
      const toolCall: Partial<ToolCall> = {
        id: dataItem.tool_call_id,
        name: dataItem.name,
        result: dataItem.content,
      };

      if (dataItem.artifact) {
        toolCall.args = dataItem.artifact;
      }

      setMessages((prevMessages) => {
        const existingMessageIndex = prevMessages.findIndex(
          msg => msg.toolCalls?.some(tc => tc.id === toolCall.id)
        );

        if (existingMessageIndex !== -1) {
          const updatedMessages = [...prevMessages];
          const existingMessage = updatedMessages[existingMessageIndex];
          
          updatedMessages[existingMessageIndex] = {
            ...existingMessage,
            toolCalls: existingMessage.toolCalls?.map(tc =>
              tc.id === toolCall.id ? { ...tc, ...toolCall } : tc
            ) || [toolCall as ToolCall]
          };
          
          return updatedMessages;
        }
        
        return prevMessages;
      });
    } else if (dataItem.type === "ai" && dataItem.content) {
      setMessages((prevMessages) => {
        const existingMessageIndex = prevMessages.findIndex(
          msg => msg.id === dataItem.id || (dataItem.content && msg.text && dataItem.content.startsWith(msg.text))
        );

        if (existingMessageIndex !== -1) {
          const updatedMessages = [...prevMessages];
          updatedMessages[existingMessageIndex] = {
            ...updatedMessages[existingMessageIndex],
            id: dataItem.id,
            text: dataItem.content
          };
          return updatedMessages;
        }

        return prevMessages;
      });
    }
  }
};

const convertToRecord = <T extends object>(data: T): Record<string, unknown> => {
  return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
};

const handleStreamEventEvent = (
  event: EventEvent,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event !== "events") return;
  const data = event.data;
  const message: Message = {
    text: "",
    rawResponse: convertToRecord(data),
    sender: "ai",
    id: data.run_id,
  };
  setMessages((prevMessages) => [...prevMessages, message]);
};

const handleStreamUpdatesEvent = (
  event: UpdateEvent,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event !== "updates") return;
  const data = event.data;
  const message: Message = {
    text: "",
    rawResponse: convertToRecord(data),
    sender: "ai",
    id: data.run_id,
  };
  setMessages((prevMessages) => [...prevMessages, message]);
};

const handleStreamValuesEvent = (
  event: ValueEvent,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event !== "values") return;
  const data = event.data;
  const message: Message = {
    text: "",
    rawResponse: convertToRecord(data),
    sender: "ai",
    id: data.run_id,
  };
  setMessages((prevMessages) => [...prevMessages, message]);
}; 