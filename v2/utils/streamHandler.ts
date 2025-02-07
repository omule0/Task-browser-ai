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
  console.log("[StreamHandler] Received event:", { 
    type: event.event,
    streamMode 
  });

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
  console.log("[StreamHandler] Processing message event:", {
    eventType: event.event,
    messageCount: event.data.length
  });

  if (event.event === "messages/partial") {
    event.data.forEach((dataItem) => {
      const toolCalls = dataItem.tool_calls;
      if (
        dataItem.type === "ai" &&
        toolCalls &&
        toolCalls.length > 0
      ) {
        console.log("[StreamHandler] Processing AI message with tool calls:", {
          messageId: dataItem.id,
          toolCallCount: toolCalls.length
        });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.sender === "ai") {
            // Merge new tool calls with existing ones
            const mergedToolCalls = [
              ...(lastMessage.toolCalls || []),
              ...toolCalls.filter(
                (newTc) =>
                  !lastMessage.toolCalls?.some(
                    (existingTc) => existingTc.id === newTc.id
                  )
              ),
            ].map((tc) => {
              const updatedTc = toolCalls.find(
                (newTc) => newTc.id === tc.id
              );
              return updatedTc ? { ...tc, ...updatedTc } : tc;
            });

            return [
              ...prevMessages.slice(0, -1),
              {
                ...lastMessage,
                toolCalls: mergedToolCalls,
              },
            ];
          } else {
            // If the last message was not from AI, add a new message
            const message: Message = {
              text: "",
              sender: "ai",
              toolCalls,
              id: dataItem.id,
            };
            return [...prevMessages, message];
          }
        });
      } else if (dataItem.content) {
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && dataItem.id === lastMessage.id) {
            return [
              ...prevMessages.slice(0, -1),
              {
                ...lastMessage,
                text: dataItem.content || "",
              },
            ];
          } else {
            const message: Message = {
              text: dataItem.content || "",
              sender: "ai",
              toolCalls: [],
              id: dataItem.id,
            };
            return [...prevMessages, message];
          }
        });
      }
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

      // Only set args if it's truthy
      if (dataItem.artifact) {
        toolCall.args = dataItem.artifact;
      }

      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.sender === "ai") {
          return [
            ...prevMessages.slice(0, -1),
            {
              ...lastMessage,
              toolCalls: lastMessage.toolCalls?.map((tc) =>
                tc.id === toolCall.id ? { ...tc, ...toolCall } : tc
              ) || [toolCall as ToolCall],
            },
          ];
        } else {
          const message: Message = {
            text: "",
            sender: "ai",
            toolCalls: [toolCall as ToolCall],
            id: dataItem.id,
          };
          return [...prevMessages, message];
        }
      });
    } else if (dataItem.type === "ai" && dataItem.content) {
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) => msg.id === dataItem.id
        );
        // Message already exists, don't add it again
        if (messageExists) {
          return prevMessages;
        }

        const messageStreamed = prevMessages.find((msg) =>
          dataItem.content?.startsWith(msg.text)
        );

        if (messageStreamed) {
          // Message has already partially been streamed, update it
          return prevMessages.map((msg) => {
            if (msg.id === messageStreamed.id && dataItem.content) {
              return { ...messageStreamed, text: dataItem.content };
            }
            return msg;
          });
        }

        const message: Message = {
          id: dataItem.id,
          text: dataItem.content || "",
          sender: "ai",
        };
        return [...prevMessages, message];
      });
    }
  }
};

const handleStreamEventEvent = (
  event: EventEvent,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event !== "events") return;
  const data = event.data;
  const message: Message = {
    text: "",
    rawResponse: data,
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
    rawResponse: data,
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
    rawResponse: data,
    sender: "ai",
    id: data.run_id,
  };
  setMessages((prevMessages) => [...prevMessages, message]);
}; 