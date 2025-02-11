import Message from "./Message";
import { Message as MessageType } from "../types";

export default function MessageList({ messages }: { messages: MessageType[] }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {messages.map((message, index) => (
        <div
          key={message.id || index}
          className="transition-all duration-300"
        >
          <Message
            rawResponse={message.rawResponse}
            text={message.text}
            sender={message.sender === "user" ? "user" : "ai"}
            toolCalls={message.toolCalls}
          />
        </div>
      ))}
    </div>
  );
}
