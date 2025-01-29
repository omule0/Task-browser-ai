import { useState } from "react";
import { ThreadState, ResearchState } from "../types";
import { updateState } from "../utils/chatApi";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThumbsUp, Loader2 } from "lucide-react";

interface Props {
  threadId: string;
  state: ThreadState;
  setAllowNullMessage: (allow: boolean) => void;
}

export function GraphInterrupt({ threadId, state, setAllowNullMessage }: Props) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const nextNode = state.next[0];
      const newState: Partial<ResearchState> = {};
      
      if (nextNode === "template_feedback_node") {
        newState.template_feedback = feedback || "approve";
      } else if (nextNode === "human_feedback") {
        newState.human_analyst_feedback = feedback || "approve";
      }

      await updateState(threadId, {
        newState,
        asNode: nextNode,
      });

      setAllowNullMessage(true);
    } catch (error) {
      console.error("Error updating state:", error);
    }
    setIsSubmitting(false);
  };

  const getPromptText = () => {
    const nextNode = state.next[0];
    if (nextNode === "template_feedback_node") {
      return {
        title: "Review Report Template",
        description: "Please review the generated report template above. You can provide feedback to modify it, or approve it as is.",
        placeholder: "Enter feedback for the template structure (or leave empty to approve)",
      };
    }
    return {
      title: "Review Analysts",
      description: "Please review the generated analysts above. You can provide feedback to modify them, or approve them as is.",
      placeholder: "Enter feedback for the analysts (or leave empty to approve)",
    };
  };

  const promptText = getPromptText();

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>{promptText.title}</CardTitle>
        <CardDescription>{promptText.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={promptText.placeholder}
          className={cn(
            "min-h-[120px] resize-none transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20",
            "placeholder:text-muted-foreground/60"
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "min-w-[120px]",
                  feedback.length === 0 && "bg-green-600 hover:bg-green-700"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : feedback ? (
                  "Submit Feedback"
                ) : (
                  <>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {feedback
                ? "Submit your feedback for review"
                : "Approve the current content"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
} 