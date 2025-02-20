import { Button } from "@/components/ui/button";
import { IconHexagon } from '@tabler/icons-react';

interface SuggestionsProps {
  onSelectTask: (task: string) => void;
}

const suggestions = [
  { title: 'Do a stock market analysis of Nvidia', onClick: () => {} },
  { title: 'Go to amazon and search for shoes and return the first 10 results', onClick: () => {} },
  { title: 'Using reddit what is the best way to learn about AI', onClick: () => {} },
  { title: 'What is the weather in tokyo like today', onClick: () => {} },
  { title: 'Search for software jobs in kampala', onClick: () => {} },
];

export const Suggestions = ({ onSelectTask }: SuggestionsProps) => (
  <>
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
        <IconHexagon className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">What&apos;s Your Task</h1>
      <p className="text-muted-foreground">
        Choose a task below or write your own to start chatting with Seam
      </p>
    </div>

    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">Ask about:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="text-sm"
            onClick={() => onSelectTask(suggestion.title)}
          >
            {suggestion.title}
          </Button>
        ))}
      </div>
    </div>
  </>
); 