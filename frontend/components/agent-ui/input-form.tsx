import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconPrompt, IconSend, IconLoader2 } from '@tabler/icons-react';
import { SettingsDrawer } from './settings-drawer';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, Math.min(300, textarea.scrollHeight))}px`;
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || task.trim().length === 0) return;
    onSubmit(e, sensitiveData);
  };

  // Calculate character count percentage for progress indicator
  const charPercentage = Math.min(100, (task.length / maxChars) * 100);
  const isNearLimit = charPercentage > 80;
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative rounded-xl overflow-hidden">
        {/* Prompt icon with enhanced focus animation */}
        <motion.div 
          animate={{ 
            opacity: isFocused ? 0.8 : 0.5,
            scale: isFocused ? 1.1 : 1
          }}
          className="absolute left-3 sm:left-4 top-3.5 sm:top-4.5 z-10"
        >
          <IconPrompt className="w-4 h-4 sm:w-5 sm:h-5 text-primary/70" />
        </motion.div>
        
        {/* Enhanced textarea with focus animations */}
        <Textarea
          ref={textareaRef}
          placeholder={loading ? "Processing..." : "Choose a task or write your own to start..."}
          value={task}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={loading}
          aria-label="Task input"
          className={cn(
            "min-h-[100px] sm:min-h-[120px] resize-none pl-10 sm:pl-12 pr-24 sm:pr-32 py-3.5 sm:py-4.5",
            "bg-background/80 border border-input/30",
            "focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/40",
            "text-sm sm:text-base rounded-xl",
            "shadow-sm hover:shadow-md focus:shadow-lg",
            "transition-all duration-300 ease-in-out",
            loading && "opacity-70 cursor-not-allowed",
            isFocused && "bg-background"
          )}
          maxLength={maxChars}
        />
        
        {/* Character count with visual indicator - fixed positioning */}
        <div className="absolute bottom-3 sm:bottom-4 right-24 sm:right-28 flex items-center">
          <div className="relative h-5">
            <div 
              className={cn(
                "text-[10px] sm:text-xs font-medium transition-colors duration-200",
                isNearLimit 
                  ? charPercentage > 95 
                    ? "text-destructive" 
                    : "text-amber-500" 
                  : "text-muted-foreground"
              )}
            >
              {task.length}/{maxChars}
            </div>
            <div className="absolute -bottom-1.5 left-0 w-full h-0.5 bg-muted/40 rounded-full">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isNearLimit 
                    ? charPercentage > 95 
                      ? "bg-destructive" 
                      : "bg-amber-500" 
                    : "bg-primary/50"
                )}
                style={{ width: `${charPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Controls container - fixed positioning */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
          {/* Settings drawer with improved styling */}
          <div className="transition-transform hover:scale-105">
            <SettingsDrawer
              onSensitiveDataChange={setSensitiveData}
            />
          </div>
          
          {/* Submit button with loading state */}
          <AnimatePresence mode="wait">
            <motion.div
              key={loading ? 'loading' : 'ready'}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                type="submit"
                size="icon"
                disabled={loading || task.trim().length === 0}
                aria-label={loading ? "Processing" : "Send message"}
                className={cn(
                  "h-8 w-8 sm:h-10 sm:w-10 rounded-full",
                  "bg-primary text-white hover:bg-primary/90",
                  "shadow-sm hover:shadow transition-all duration-200",
                  "flex items-center justify-center",
                  loading && "cursor-not-allowed opacity-70"
                )}
              >
                {loading ? (
                  <IconLoader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <IconSend className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}; 