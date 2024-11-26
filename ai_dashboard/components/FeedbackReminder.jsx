import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useLocalStorage } from "@/hooks/use-local-storage";

export function FeedbackReminder() {
  const [open, setOpen] = useState(false);
  const [lastReminder, setLastReminder] = useLocalStorage("last-feedback-reminder", null);
  const [hasFeedback, setHasFeedback] = useLocalStorage("has-given-feedback", false);
  
  const REMINDER_DELAY = 1440; // 1 day between reminders
  const INITIAL_DELAY = 5; // Minutes before first reminder

  useEffect(() => {
    // Skip if user has already given feedback
    if (hasFeedback) return;

    const checkReminderStatus = () => {
      const now = new Date();
      const lastReminderDate = lastReminder ? new Date(lastReminder) : null;
      
      // If no previous reminder, check if initial delay has passed
      if (!lastReminderDate) {
        const firstUseDate = localStorage.getItem("first-use-date");
        if (!firstUseDate) {
          localStorage.setItem("first-use-date", now.toISOString());
          return;
        }

        const minutesSinceFirstUse = Math.floor(
          (now - new Date(firstUseDate)) / (1000 * 60)
        );
        
        if (minutesSinceFirstUse >= INITIAL_DELAY) {
          setOpen(true);
          setLastReminder(now.toISOString());
        }
        return;
      }

      // Check if reminder delay has passed
      const minutesSinceLastReminder = Math.floor(
        (now - lastReminderDate) / (1000 * 60)
      );
      
      if (minutesSinceLastReminder >= REMINDER_DELAY) {
        setOpen(true);
        setLastReminder(now.toISOString());
      }
    };

    // Check on component mount and set up interval
    checkReminderStatus();
    const interval = setInterval(checkReminderStatus, 1000 * 30); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [lastReminder, hasFeedback, setLastReminder]);

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>How are you enjoying the application?</AlertDialogTitle>
          <AlertDialogDescription>
            We'd love to hear your feedback to help improve your experience.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setOpen(false);
              setLastReminder(new Date().toISOString());
            }}
          >
            Maybe later
          </AlertDialogCancel>
          <FeedbackDialog 
            onFeedbackSubmitted={() => {
              setHasFeedback(true);
              setOpen(false);
            }}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 