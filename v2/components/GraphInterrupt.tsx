import { useState } from "react";
import { ThreadState, ResearchState } from "../types";
import { updateState } from "../utils/chatApi";

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
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-800 rounded-lg mt-4">
      <h3 className="text-xl font-semibold text-white mb-2">{promptText.title}</h3>
      <p className="text-gray-300 mb-4">{promptText.description}</p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={promptText.placeholder}
        className="w-full h-32 p-2 bg-gray-700 text-white rounded-lg mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : feedback ? "Submit Feedback" : "Approve"}
      </button>
    </div>
  );
} 