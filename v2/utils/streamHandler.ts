import { StreamMode } from "@/components/Settings";
import { Message, ToolCall } from "../types";

export const handleStreamEvent = (
  event: any,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  streamMode: StreamMode
) => {
  // Log the raw event first
  console.log(`[${streamMode}] Received event:`, event);

  if (streamMode === "messages") {
    handleStreamMessageEvent(event, setMessages);
  } else if (streamMode === "events") {
    handleStreamEventEvent(event, setMessages);
  } else if (streamMode === "updates") {
    handleStreamUpdatesEvent(event, setMessages);
  } else if (streamMode === "values") {
    handleStreamValuesEvent(event, setMessages);
  }
};

const formatLogMessage = (prefix: string, data: any): string => {
  return `${prefix}:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
};

const handleStreamMessageEvent = (
  event: any,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const logMessage = formatLogMessage("Message Event", {
    event: event.event,
    data: event.data
  });

  setMessages((prevMessages) => [
    ...prevMessages,
    {
      id: `log_${Date.now()}`,
      text: logMessage,
      sender: "system",
    }
  ]);
};

const handleStreamEventEvent = (
  event: any,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event !== "events") return;

  const logMessage = formatLogMessage("Event Log", {
    type: "event",
    event: event.data.event,
    name: event.data.name,
    metadata: event.data.metadata,
    data: event.data.data
  });

  setMessages((prevMessages) => [
    ...prevMessages,
    {
      id: `log_${Date.now()}`,
      text: logMessage,
      sender: "system",
    }
  ]);
};

const handleStreamUpdatesEvent = (
  event: any,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event !== "updates") return;

  const logMessage = formatLogMessage("State Update", {
    step: event.data.step,
    next: event.data.next,
    values: event.data.values,
    metadata: event.data.metadata
  });

  setMessages((prevMessages) => [
    ...prevMessages,
    {
      id: `log_${Date.now()}`,
      text: logMessage,
      sender: "system",
    }
  ]);
};

const handleStreamValuesEvent = (
  event: any,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  if (event.event !== "values") return;

  const logMessage = formatLogMessage("Values Update", {
    topic: event.data.topic,
    max_analysts: event.data.max_analysts,
    analysts: event.data.analysts,
    sections: event.data.sections?.map((s: string) => s.substring(0, 100) + "..."),
    report_template: event.data.report_template ? "Present" : "Not present",
    final_report: event.data.final_report ? "Present" : "Not present"
  });

  setMessages((prevMessages) => [
    ...prevMessages,
    {
      id: `log_${Date.now()}`,
      text: logMessage,
      sender: "system",
    }
  ]);
}; 