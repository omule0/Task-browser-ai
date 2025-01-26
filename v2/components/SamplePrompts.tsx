import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  onMessageSelect: (message: string) => void;
}

export default function SamplePrompts({ onMessageSelect }: Props) {
  const questions = [
    {
      id: 1,
      message: "Research the current state and challenges of AI Safety with 3 analysts",
      className: "col-span-2 lg:col-span-1",
    },
    {
      id: 2,
      message: "Analyze the latest developments in climate change mitigation with 4 analysts",
      className: "col-span-2 lg:col-span-1",
    },
    {
      id: 3,
      message: "Study recent breakthroughs in quantum computing with 2 analysts",
      className: "col-span-2",
    },
    {
      id: 4,
      message: "Explore the latest trends and innovations in biotechnology with 3 analysts",
      className: "col-span-2",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-2 md:p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 text-center">
          <p className="text-xs text-muted-foreground md:text-sm">
            Select a topic or ask your own research question. Our team of expert analysts will help you gather comprehensive insights.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {questions.map((question) => (
            <Card
              key={question.id}
              className={cn(
                question.className,
                "group relative cursor-pointer overflow-hidden rounded-full border-0 bg-card/40 shadow-sm backdrop-blur-sm transition-all duration-200",
                "hover:bg-card/60 hover:shadow-md active:scale-[0.98]",
                "dark:bg-muted/40 dark:hover:bg-muted/60 dark:shadow-none dark:ring-1 dark:ring-muted/10"
              )}
              onClick={() => onMessageSelect(question.message)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onMessageSelect(question.message)}
            >
              <div className="px-4 py-2.5">
                <p className="text-xs leading-tight text-card-foreground md:text-sm dark:text-muted-foreground/90">
                  {question.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
