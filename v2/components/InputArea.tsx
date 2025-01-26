"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="w-full p-4">
      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-4xl gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What should I research for you?"
          className="flex-1 h-14 rounded-full bg-muted px-6 text-lg text-foreground placeholder:text-muted-foreground border border-input hover:border-accent focus:border-ring ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <Button
          type="submit"
          className="h-14 px-8 rounded-full bg-[#7d8dff] hover:bg-[#6b7dff] text-white font-medium text-lg transition-colors"
          aria-label="Send message"
        >
          Research
        </Button>
      </form>
    </div>
  );
}
