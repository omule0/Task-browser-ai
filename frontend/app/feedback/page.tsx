'use client';

import { useState } from 'react';
import { FeedbackForm } from '@/components/agent-ui';
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from '@/lib/feedback-service';

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFeedbackSubmit = async (rating: number, feedbackText: string) => {
    setLoading(true);
    
    try {
      const result = await submitFeedback(rating, feedbackText);
      
      if (result) {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback! We appreciate your input.",
        });
      } else {
        throw new Error('No result returned from feedback submission');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="max-w-md mx-auto mt-4 sm:mt-8 md:mt-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 md:mb-3 text-center">
            Your Feedback Matters
          </h1>
          <p className="text-sm sm:text-base text-center text-muted-foreground max-w-sm mx-auto">
            We&apos;d love to hear about your experience with our service
          </p>
        </div>
        
        <div className="bg-background rounded-xl border-2 border-border p-4 sm:p-6 shadow-md sm:shadow-lg">
          <FeedbackForm 
            onSubmit={handleFeedbackSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
} 