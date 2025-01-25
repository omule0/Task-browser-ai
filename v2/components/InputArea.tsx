import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Settings2 } from "lucide-react";

export default function InputArea({
  onSendMessage,
  disabled
}: {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
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
    <main className="px-8 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={disabled}
              placeholder="What should I research for you?"
              className="w-full h-14 pl-6 pr-32 text-lg bg-accent/50 border-accent"
            />
            <Button
              type="submit"
              disabled={disabled}
              className="absolute right-2 top-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Research
            </Button>
          </div>
        </form>
        
        <div className="text-center space-y-2 text-sm text-muted-foreground">
          <p>Powered by our advanced AI that aims for objective and factual results at speed. <a href="#" className="underline">Learn more.</a></p>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm mb-8">
          <Settings2 className="h-4 w-4" />
          <span>Preferences</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 auto-rows-min">
          <Button 
            variant="outline" 
            onClick={() => onSendMessage("How to improve problem-solving skills?")}
            className="w-full justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
          >
            How to improve problem-solving skills?
          </Button>
          <Button 
            variant="outline"
            onClick={() => onSendMessage("How to legally avoid taxes when inheriting property in California?")}
            className="w-full justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
          >
            How to legally avoid taxes when inheriting property in California?
          </Button>
          <Button 
            variant="outline"
            onClick={() => onSendMessage("What are the most promising cryptocurrency projects right now?")}
            className="col-span-2 justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
          >
            What are the most promising cryptocurrency projects right now?
          </Button>
          <Button 
            variant="outline"
            onClick={() => onSendMessage("What's the optimal tech stack for building a SaaS product?")}
            className="col-span-2 justify-start p-6 text-left h-auto bg-accent/50 hover:bg-accent/60"
          >
            What's the optimal tech stack for building a SaaS product?
          </Button>
        </div>
      </div>
    </main>
  );
}
