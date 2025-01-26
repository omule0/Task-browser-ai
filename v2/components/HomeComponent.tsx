import React from "react";

interface Props {
  onMessageSelect: (message: string) => void;
}

export default function HomeComponent({ onMessageSelect }: Props) {
  const questions = [
    {
      id: 1,
      text: "Research AI Safety",
      message: "Research the current state and challenges of AI Safety with 3 analysts",
      className: "col-span-2 lg:col-span-1",
    },
    {
      id: 2,
      text: "Analyze Climate Change",
      message: "Analyze the latest developments in climate change mitigation with 4 analysts",
      className: "col-span-2 lg:col-span-1",
    },
    {
      id: 3,
      text: "Study Quantum Computing",
      message: "Study recent breakthroughs in quantum computing with 2 analysts",
      className: "col-span-2",
    },
    {
      id: 4,
      text: "Explore Biotechnology Trends",
      message: "Explore the latest trends and innovations in biotechnology with 3 analysts",
      className: "col-span-2",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Research Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Select a topic or ask your own research question. Our team of expert analysts will help you gather comprehensive insights.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {questions.map((question) => (
            <div
              key={question.id}
              className={`${question.className} group cursor-pointer transition-all duration-300 hover:-translate-y-1`}
              onClick={() => onMessageSelect(question.message)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onMessageSelect(question.message)}
            >
              <div className="flex h-full flex-col rounded-2xl bg-card/50 p-6 shadow-lg backdrop-blur-sm transition-colors duration-300 hover:bg-card/60">
                <h2 className="mb-2 text-xl font-medium text-foreground md:text-2xl lg:text-3xl">
                  {question.text}
                </h2>
                <p className="text-sm text-muted-foreground md:text-base">
                  {question.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
