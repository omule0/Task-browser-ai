import { Message } from "@/types";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-lg ${
            message.sender === "user"
              ? "bg-primary/10 ml-auto max-w-[85%]"
              : "bg-muted mr-auto max-w-[85%]"
          }`}
        >
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {message.sender === "user" ? "You" : "Assistant"}
          </div>
          <div className="prose prose-sm dark:prose-invert">
            {message.text}
            {message.rawResponse && (
              <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-x-auto">
                {JSON.stringify(message.rawResponse, null, 2)}
              </pre>
            )}
            {message.toolCalls?.map((tool) => (
              <div key={tool.id} className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <div className="font-medium">Tool: {tool.name}</div>
                <pre className="mt-1 overflow-x-auto">{tool.args}</pre>
                {tool.result && (
                  <pre className="mt-1 text-success overflow-x-auto">
                    Result: {JSON.stringify(tool.result, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
