import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function InputArea({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-0">
      <div className="">
        <div className="">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={cn(
             
            )}
            placeholder="Message StreamChat"
          />
          <button
            type="submit"
            className=""
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M11.394 6.68a.857.857 0 0 1 1.212 0l3.857 3.857a.857.857 0 0 1-1.212 1.212l-2.394-2.394v7.36a.857.857 0 0 1-1.714 0v-7.36l-2.394 2.394a.857.857 0 1 1-1.212-1.212z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
