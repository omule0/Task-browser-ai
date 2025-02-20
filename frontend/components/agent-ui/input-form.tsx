import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IconPrompt, IconSend, IconLock, IconMail } from '@tabler/icons-react';
import { SensitiveDataForm } from './sensitive-data-form';
import { EmailNotification } from './email-notification';
import { cn } from "@/lib/utils";

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
  const [showSensitiveForm, setShowSensitiveForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
      setShowEmailForm(true);
    }
  }, [defaultEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, sensitiveData, email);
  };

  return (
    <Card className="p-4 shadow-none bg-muted/50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-4 opacity-50">
            <IconPrompt size={18} />
          </div>
          <Textarea
            placeholder={loading ? "Processing..." : "Ask AI a question or make a request..."}
            value={task}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={loading}
            className={`min-h-[120px] resize-none pl-12 pr-32 py-4 bg-transparent border-0 focus-visible:ring-0 text-base ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            maxLength={maxChars}
          />
          <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
            {task.length}/{maxChars}
          </div>
          <div className="absolute bottom-3 right-16 flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowSensitiveForm(!showSensitiveForm)}
              className={cn(
                "h-12 w-12 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
                showSensitiveForm && "text-primary hover:text-primary"
              )}
              aria-label="Toggle sensitive data form"
            >
              <IconLock size={18} />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowEmailForm(!showEmailForm)}
              className={cn(
                "h-12 w-12 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
                showEmailForm && "text-primary hover:text-primary"
              )}
              aria-label="Toggle email notification form"
            >
              <IconMail size={18} />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={loading || task.length === 0}
              className={`h-12 w-12 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground ${
                loading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <IconSend size={18} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          {showSensitiveForm && (
            <div className="w-full">
              <SensitiveDataForm onSensitiveDataChange={setSensitiveData} />
            </div>
          )}
          {showEmailForm && (
            <div className="w-full">
              <EmailNotification onEmailChange={setEmail} defaultEmail={defaultEmail} />
            </div>
          )}
        </div>
      </form>
    </Card>
  );
}; 