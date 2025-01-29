import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Globe, Cpu, Dna } from "lucide-react";

interface Props {
  onMessageSelect: (message: string) => void;
}

export default function SamplePrompts({ onMessageSelect }: Props) {
  const questions = [
    {
      id: 1,
      message: "Research the current state and challenges of AI Safety",
      icon: <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />,
      className: "col-span-full sm:col-span-2 lg:col-span-1",
    },
    {
      id: 2,
      message: "Analyze the latest developments in climate change mitigation",
      icon: <Globe className="h-4 w-4 sm:h-5 sm:w-5" />,
      className: "col-span-full sm:col-span-2 lg:col-span-1",
    },
    {
      id: 3,
      message: "Study recent breakthroughs in quantum computing",
      icon: <Cpu className="h-4 w-4 sm:h-5 sm:w-5" />,
      className: "col-span-full sm:col-span-2",
    },
    {
      id: 4,
      message: "Explore the latest trends and innovations in biotechnology",
      icon: <Dna className="h-4 w-4 sm:h-5 sm:w-5" />,
      className: "col-span-full sm:col-span-2",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-background/80 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="mb-2 text-lg font-semibold sm:text-xl md:text-2xl">
            Ready to explore?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground md:text-base px-2">
            Select a topic or ask your own research question. Our team of expert analysts 
            will help you gather comprehensive insights.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          {questions.map((question) => (
            <Card
              key={question.id}
              className={`
                ${question.className}
                group relative cursor-pointer overflow-hidden border-0
                bg-gradient-to-br from-card/90 to-card/50
                p-3 sm:p-4 transition-all duration-300
                hover:shadow-lg hover:from-card hover:to-card/80
                dark:from-muted/30 dark:to-muted/20
                dark:hover:from-muted/40 dark:hover:to-muted/30
                dark:shadow-none dark:ring-1 dark:ring-muted/10
              `}
              onClick={() => onMessageSelect(question.message)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onMessageSelect(question.message)}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="rounded-full bg-primary/10 p-1.5 sm:p-2 text-primary">
                  {question.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm md:text-base font-medium leading-snug text-foreground">
                    {question.message}
                  </p>
                </div>
                <ArrowRight className="mt-0.5 sm:mt-1 h-3 w-3 sm:h-4 sm:w-4 transform opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}