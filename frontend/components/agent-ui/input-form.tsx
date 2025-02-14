import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IconPrompt, IconSend } from '@tabler/icons-react';

interface InputFormProps {
  task: string;
  loading: boolean;
  maxChars: number;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const InputForm = ({ 
  task, 
  loading, 
  maxChars, 
  onSubmit, 
  onChange, 
  onKeyDown 
}: InputFormProps) => (
  <Card className="p-0 shadow-none bg-muted/50">
    <form onSubmit={onSubmit} className="relative">
      <div className="flex items-end">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-4 opacity-50">
            <IconPrompt size={18} />
          </div>
          <Textarea
            placeholder={loading ? "Processing..." : "Ask AI a question or make a request..."}
            value={task}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={loading}
            className={`min-h-[120px] resize-none pl-12 pr-20 py-4 bg-transparent border-0 focus-visible:ring-0 text-base ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            maxLength={maxChars}
          />
          <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
            {task.length}/{maxChars}
          </div>
        </div>
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={loading || task.length === 0}
        className={`absolute bottom-3 right-12 h-8 w-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground ${
          loading ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <IconSend size={18} />
      </Button>
    </form>
  </Card>
); 