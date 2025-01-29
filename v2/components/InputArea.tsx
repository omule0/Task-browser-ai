"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function InputArea({
  onSendMessage,
  disabled = false,
  className,
}: InputAreaProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className={cn("relative w-full p-2 sm:p-4 mt-[50px] sm:mt-[10px]", className)}>
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[850px] flex gap-2 px-2 sm:px-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What should I research for you?"
          disabled={disabled}
          className="flex-1 h-10 sm:h-14 rounded-full bg-muted px-3 sm:px-6 text-base sm:text-lg text-foreground placeholder:text-muted-foreground border border-input hover:border-accent focus:border-ring ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={disabled}
          className="h-10 sm:h-14 px-4 sm:px-8 rounded-full bg-[#7d8dff] hover:bg-[#6b7dff] text-white font-medium text-sm sm:text-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          aria-label="Send message"
        >
          {disabled ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 sm:h-5 w-4 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Researching...</span>
            </div>
          ) : (
            "Research"
          )}
        </Button>
      </form>
    </div>
  );
}
