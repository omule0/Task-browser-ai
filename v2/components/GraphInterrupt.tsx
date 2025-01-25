import { useState } from "react";
import { ResearchState } from "../types";
import { ThreadState } from "@langchain/langgraph-sdk";
import { updateState } from "../utils/chatApi";

interface Props {
  threadId: string;
  state: ThreadState<ResearchState>;
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
    <div className="w-full p-4 bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2 text-gray-100">{promptText.title}</h3>
      <p className="text-gray-300 mb-4">{promptText.description}</p>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder={promptText.placeholder}
        className="w-full h-32 p-2 mb-4 bg-gray-700 text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
} 