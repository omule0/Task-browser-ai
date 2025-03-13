'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from "@/components/sidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/app/providers";
import '../app/globals.css';
import { MessageSquare } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { FeedbackForm } from "@/components/agent-ui/feedback-form";
import { submitFeedback } from "@/lib/feedback-service";
import { useToast } from "@/hooks/use-toast";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

// Create a singleton instance for sidebar state
let sidebarInstance: { isCollapsed: boolean } | null = null;

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [mounted, setMounted] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (!sidebarInstance) {
      sidebarInstance = { isCollapsed: true };
    }
    return sidebarInstance.isCollapsed;
  });
  
  // State for feedback dialog visibility
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSidebarToggle = (value: boolean) => {
    setIsSidebarCollapsed(value);
    if (sidebarInstance) {
      sidebarInstance.isCollapsed = value;
    }
  };
  
  const handleFeedbackSubmit = async (rating: number, feedbackText: string) => {
    try {
      setIsSubmitting(true);
      await submitFeedback(rating, feedbackText);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });
      setIsFeedbackOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use useEffect to handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <Providers>
      <div className="relative">
        <Header 
          isCollapsed={isSidebarCollapsed} 
          onToggle={handleSidebarToggle}
        />
        <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-background text-foreground pt-4 sm:pt-6">
          <Sidebar isCollapsed={isSidebarCollapsed} />
          <main className={cn(
            "flex-1 w-full transition-all duration-300 ease-in-out",
            isSidebarCollapsed 
              ? "ml-0" 
              : "ml-[180px] sm:ml-[200px]"
          )}>
            <div className="h-full px-3 sm:px-4 py-3 sm:py-4">
              {children}
            </div>
          </main>
        </div>
        
        {/* Floating Feedback Button */}
        <button 
          onClick={() => setIsFeedbackOpen(true)}
          className="fixed bottom-6 right-6 rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-all z-50"
          aria-label="Give feedback"
          tabIndex={0}
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        
        {/* Feedback Modal */}
        <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-center">
                We&apos;d Love Your Feedback
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <FeedbackForm 
                onSubmit={handleFeedbackSubmit}
                loading={isSubmitting} 
              />
            </div>
          </DialogContent>
        </Dialog>
        
        <Toaster />
      </div>
    </Providers>
  );
} 