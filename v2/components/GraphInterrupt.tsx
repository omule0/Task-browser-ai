"use client";

import { useState } from "react";
import { ThreadState, ResearchState } from "../types";
import { updateState } from "../utils/chatApi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageCircle, Search, Paperclip, Star, Send, X, MessageSquare, ThumbsUp, Loader2, Minimize2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  threadId: string;
  state: ThreadState;
  setAllowNullMessage: (allow: boolean) => void;
  onContinue: (message: string | null) => void;
}

export function GraphInterrupt({ threadId, state, setAllowNullMessage, onContinue }: Props) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const nextNode = state.next[0];
      const newState: Partial<ResearchState> = {};
      const isApproval = !feedback;
      
      if (nextNode === "template_feedback_node") {
        newState.template_feedback = feedback || "approve";
      } else if (nextNode === "human_feedback") {
        newState.human_analyst_feedback = feedback || "approve";
      }

      await updateState(threadId, {
        newState,
        asNode: nextNode,
      });

      // Automatically continue research if it's an approval
      if (isApproval) {
        setAllowNullMessage(true);
        setIsOpen(false);
        // Automatically continue research
        onContinue(null);
      } else {
        setAllowNullMessage(true);
      }
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
      };
    }
    return {
      title: "Review Analysts",
      description: "Please review the generated analysts above. You can provide feedback to modify them, or approve them as is.",
    };
  };

  const promptText = getPromptText();

  return (
    <div className="fixed bottom-[80px] right-4 flex flex-col items-end z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? "auto" : "auto"
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md mb-4"
          >
            <Card className="overflow-hidden rounded-3xl shadow-xl">
              {/* Header */}
              <div className="bg-[#0052FF] text-white p-4">
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" className="text-white hover:text-white/90">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    {promptText.title}
                  </Button>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-white hover:text-white/90"
                            onClick={() => setIsMinimized(!isMinimized)}
                          >
                            <Minimize2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isMinimized ? "Expand" : "Minimize"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-white hover:text-white/90"
                            onClick={() => setIsOpen(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Close
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <AnimatePresence>
                  {!isMinimized && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="flex -space-x-2 mb-3">
                        <Avatar className="border-2 border-[#0052FF]">
                          <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      </div>
                      <h1 className="text-xl font-semibold mb-1">{promptText.description}</h1>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Feedback Area */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 max-h-[400px] overflow-y-auto p-4"
                  >
                    <div className="space-y-4">
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter your feedback here..."
                        className="min-h-[120px] w-full resize-none rounded-xl border-gray-200 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] transition-colors"
                      />
                      <div className="flex justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={cn(
                                  "min-w-[120px]",
                                  feedback.length === 0 ? "bg-green-600 hover:bg-green-700" : "bg-[#0052FF] hover:bg-[#0052FF]/90"
                                )}
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : feedback ? (
                                  <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {feedback ? "Submit your feedback for review" : "Approve the current content"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <Button
        size="icon"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "rounded-full bg-[#0052FF] hover:bg-[#0052FF]/90 h-14 w-14 transition-transform duration-200 ease-in-out shadow-lg",
          isOpen && "hidden"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
} 