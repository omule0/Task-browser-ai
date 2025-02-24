import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconPrompt, IconSend } from '@tabler/icons-react';
import { SettingsDrawer } from './settings-drawer';

interface InputFormProps {
  task: string;
  loading: boolean;
  maxChars: number;
  onSubmit: (e: React.FormEvent, sensitiveData?: Record<string, string>, email?: string | null) => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  defaultEmail?: string | null;
}

export const InputForm = ({ 
  task, 
  loading, 
  maxChars, 
  onSubmit, 
  onChange, 
  onKeyDown,
  defaultEmail
}: InputFormProps) => {
  const [sensitiveData, setSensitiveData] = useState<Record<string, string>>({});
  const [email, setEmail] = useState<string | null>(defaultEmail || null);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, sensitiveData, email);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="absolute left-3 sm:left-4 top-3 sm:top-4 opacity-50">
        <IconPrompt className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
      </div>
      <Textarea
        placeholder={loading ? "Processing..." : "Choose a task below or write your own to start running your task..."}
        value={task}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={loading}
        className={`min-h-[100px] sm:min-h-[120px] resize-none pl-10 sm:pl-12 pr-24 sm:pr-32 py-3 sm:py-4 bg-muted/50 border-0  focus-visible:ring-0 text-sm sm:text-base rounded-lg shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_12px_-3px_rgba(0,0,0,0.1)] focus:shadow-[0_2px_16px_-3px_rgba(0,0,0,0.15)] transition-shadow duration-200 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        maxLength={maxChars}
      />
      <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-4 text-[10px] sm:text-xs text-muted-foreground">
        {task.length}/{maxChars}
      </div>
      <div className="absolute bottom-2 sm:bottom-3 right-12 sm:right-16 flex items-center gap-1.5 sm:gap-2">
        <SettingsDrawer
          onSensitiveDataChange={setSensitiveData}
          onEmailChange={setEmail}
          defaultEmail={defaultEmail}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || task.length === 0}
          className={`h-8 w-8 sm:h-12 sm:w-12 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground ${
            loading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          <IconSend className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </Button>
      </div>
    </form>
  );
}; 