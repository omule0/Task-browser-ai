import React from "react";

interface Props {
  onMessageSelect: (message: string) => void;
}

export default function HomeComponent({ onMessageSelect }: Props) {
  const examples = [
    {
      title: "Research AI Safety",
      message: "Research the current state and challenges of AI Safety with 3 analysts",
      topic: "AI Safety",
      analysts: 3,
    },
    {
      title: "Analyze Climate Change",
      message: "Analyze the latest developments in climate change mitigation with 4 analysts",
      topic: "Climate Change Mitigation",
      analysts: 4,
    },
    {
      title: "Study Quantum Computing",
      message: "Study recent breakthroughs in quantum computing with 2 analysts",
      topic: "Quantum Computing Advances",
      analysts: 2,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Research Assistant</h1>
      <p className="text-gray-300 mb-8 text-center max-w-2xl">
        I can help you research any topic by creating a team of expert analysts who will gather information and compile a comprehensive report.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {examples.map((example) => (
          <button
            key={example.title}
            onClick={() => onMessageSelect(example.message)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg text-left transition-colors"
          >
            <h3 className="font-semibold mb-2">{example.title}</h3>
            <p className="text-sm text-gray-400">{example.message}</p>
          </button>
        ))}
      </div>
      <div className="mt-8 text-gray-400 text-sm">
        <p>You can also type your own research topic and specify the number of analysts.</p>
      </div>
    </div>
  );
}
