import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { customToast } from "@/components/ui/toast-theme";

export function FeedbackDialog({ onFeedbackSubmitted }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    
    setIsSubmitting(true);
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('feedback').insert([
        {
          user_id: user?.id,
          rating,
          feedback,
          created_at: new Date().toISOString(),
        }
      ]);

      if (error) throw error;

      // Reset form
      setRating(null);
      setFeedback("");
      setOpen(false);
      
      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      // Show success toast
      customToast.success("Thank you for your feedback! Your feedback helps us improve our service.");
    } catch (error) {
      console.error('Error submitting feedback:', error);
      customToast.error("Error submitting feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Share your feedback</DialogTitle>
          <DialogDescription>
            Help us improve your experience. Your feedback is valuable to us.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:py-4">
          <div className="space-y-2">
            <Label>How would you rate your experience?</Label>
            <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:space-x-4">
              {[
                { value: "1", emoji: "😡" },
                { value: "2", emoji: "😞" },
                { value: "3", emoji: "😑" },
                { value: "4", emoji: "😃" },
                { value: "5", emoji: "🤩" }
              ].map(({ value, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`text-2xl transition-transform hover:scale-125 ${
                    rating === value ? 'scale-125' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback">Additional feedback (optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what we can improve..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter className="sm:mt-2">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!rating || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Submitting..." : "Submit feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 