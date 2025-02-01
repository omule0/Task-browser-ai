"use client"

import React from "react"
import { FileText, Link, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PromptsProps {
  className?: string;
  onLinkClick?: () => void;
  onMessageSelect?: (message: string | null) => void;
  onSettingsClick?: () => void;
}

const sampleQuestions = [
  {
    id: 1,
    message: "Deepseek vs ChatGPT",
  },
  {
    id: 2,
    message: "China's Investment in Africa",
  },
  {
    id: 3,
    message: "AI agents in 2025",
  },
];

export default function Prompts({
  className,
  onLinkClick,
  onMessageSelect,
  onSettingsClick
}: PromptsProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<number | null>(null)

  const handlePromptClick = (id: number, message: string) => {
    setSelectedId(id)
    onMessageSelect?.(message)
    // Reset the selected state after a short delay
    setTimeout(() => setSelectedId(null), 1000)
  }

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className={cn("flex items-center justify-between py-2 px-4 bg-white rounded-full shadow hover:shadow-lg transition-all duration-300 cursor-pointer", className)}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600">My Prompts</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onLinkClick?.();
                }}
                aria-label="Link"
              >
                <Link className="w-5 h-5 text-gray-600" />
              </button>
              <ChevronDown className={cn(
                "h-4 w-4 text-gray-600 transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )} />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="w-full max-w-3xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <TooltipProvider>
                {sampleQuestions.map((question) => (
                  <Tooltip key={question.id}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          "bg-white rounded-full px-6 py-3 shadow hover:shadow-lg transition-all duration-300 flex items-center justify-center group",
                          selectedId === question.id && "bg-blue-50 ring-2 ring-blue-500"
                        )}
                        onClick={() => handlePromptClick(question.id, question.message)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handlePromptClick(question.id, question.message)}
                        disabled={selectedId !== null}
                      >
                        <span className={cn(
                          "text-gray-600 group-hover:text-gray-800",
                          selectedId === question.id && "text-blue-600"
                        )}>
                          {question.message}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Try this prompt</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
} 