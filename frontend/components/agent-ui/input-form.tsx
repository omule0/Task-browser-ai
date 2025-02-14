import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { IconPrompt, IconSend } from '@tabler/icons-react';
import { SensitiveDataForm } from './sensitive-data-form';


interface InputFormProps {
  task: string;
  loading: boolean;
  maxChars: number;
  onSubmit: (e: React.FormEvent, sensitiveData?: Record<string, string>) => void;
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
}: InputFormProps) => {
  const [sensitiveData, setSensitiveData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, sensitiveData);
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
            className={`min-h-[120px] resize-none pl-12 pr-20 py-4 bg-transparent border-0 focus-visible:ring-0 text-base ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            maxLength={maxChars}
          />
          <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
            {task.length}/{maxChars}
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
        </div>

        <div className="flex justify-start">
        <div className="w-full">
            <SensitiveDataForm onSensitiveDataChange={setSensitiveData} />
          </div>

          
        </div>
      </form>
    </Card>
  );
}; 