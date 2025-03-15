'use client';

import { useState } from 'react';
// import { IconInfoCircle } from '@tabler/icons-react';
import { 
  InputForm,
  Suggestions,
} from '@/components/agent-ui';
import { createClient } from '@/utils/supabase/client';
import { useToast } from "@/hooks/use-toast";
import TemplateSection from '@/components/TemplateSection';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Add new interface for template events
interface TemplateFormEvent extends React.FormEvent {
  templateTask?: string;
}

export default function Home() {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const MAX_CHARS = 2000;
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (task.trim() && !loading) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please sign in to send messages.",
          });
          return;
        }
        
        const syntheticEvent = {
          preventDefault: () => {},
          target: e.target,
        } as React.FormEvent<HTMLFormElement>;
        handleSubmit(syntheticEvent);
      }
    }
  };

  const handleSubmit = async (e: TemplateFormEvent, sensitiveData?: Record<string, string>) => {
    e.preventDefault();
    const currentTask = e.templateTask || task;
    if (!currentTask.trim()) {
      console.warn('[Submit] Empty task submitted');
      return;
    }

    console.log('[Submit] Starting task submission:', {
      hasTemplateTask: !!e.templateTask,
      hasSensitiveData: !!sensitiveData
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('[Submit] No active session found');
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to send messages.",
        });
        return;
      }

      // Generate a unique ID for the new chat
      const taskId = uuidv4();

      // Store task in localStorage for state persistence
      localStorage.setItem(`task_${taskId}`, currentTask);
      
      // Redirect to the task_chat page with the task ID
      setLoading(true);
      router.push(`/task_chat/${taskId}?task=${encodeURIComponent(currentTask)}`);
      
    } catch (e) {
      console.error('[Submit] Error starting task:', e);
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : 'An error occurred',
      });
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-6rem)] flex items-center justify-center w-full">
      <div className="w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl px-4 sm:px-6 py-6 sm:py-8 md:py-12 mx-auto">
        {/* Status Message - kept as commented for reference
        <div className="mb-4 md:mb-8 p-3 md:p-4 bg-background rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <IconInfoCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-primary" />
            </div>
            <p className="text-sm md:text-base">Things might take a moment, but we&apos;re scaling up. Thanks for being part of the journey! 🚀</p>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 md:space-y-10 animate-fade-in">
          <div className="transform transition-all duration-300 ease-in-out">
            <Suggestions />
          </div>
          
          <div className="transform transition-all duration-300 ease-in-out hover:shadow-md">
            <InputForm
              task={task}
              loading={loading}
              maxChars={MAX_CHARS}
              onSubmit={handleSubmit}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="transform transition-all duration-300 ease-in-out">
            <TemplateSection 
              onSubmit={(templateTask) => {
                setTask(templateTask);
                const event = { preventDefault: () => {}, templateTask } as TemplateFormEvent;
                handleSubmit(event);
              }} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
