import { useEffect, useState } from 'react';
import { 
  IconRocket,
  IconWorld,
  IconTarget,
  IconBrain,
  IconX,
  IconCheck,
  IconVideo,
} from '@tabler/icons-react';

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif' | 'section' | 'run_id';
  message?: string;
  success?: boolean;
  title?: string;
  items?: string[];
}

const getEventIcon = (type: ProgressEvent['type']) => {
  switch (type) {
    case 'start':
      return <IconRocket size={18} className="inline-block" />;
    case 'url':
      return <IconWorld size={18} className="inline-block" />;
    case 'action':
      return <IconTarget size={18} className="inline-block" />;
    case 'thought':
      return <IconBrain size={18} className="inline-block" />;
    case 'error':
      return <IconX size={18} className="inline-block text-destructive" />;
    case 'complete':
      return <IconCheck size={18} className="inline-block text-success" />;
    case 'gif':
      return <IconVideo size={18} className="inline-block" />;
    case 'run_id':
      return null;
    default:
      return null;
  }
};

interface AgentStepsProps {
  progress: ProgressEvent[];
  isStreaming?: boolean;
}

export const AgentSteps = ({ progress, isStreaming = false }: AgentStepsProps) => {
  const [sections, setSections] = useState<Record<string, string[]>>({});
  const [events, setEvents] = useState<ProgressEvent[]>([]);

  useEffect(() => {
    // Update sections and events when progress changes
    const newSections = progress.reduce((acc: Record<string, string[]>, event) => {
      if (event.type === 'section' && event.title && event.items) {
        acc[event.title] = event.items;
      }
      return acc;
    }, {});
    setSections(newSections);
    setEvents(progress);
  }, [progress]);

  return (
    <div className="space-y-6">
      {/* Stream individual events */}
      {events.map((event, index) => (
        event.type !== 'section' && event.message && (
          <div key={`${event.type}-${index}`} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="mt-1">
              {getEventIcon(event.type)}
            </div>
            <p className={`text-sm ${event.type === 'error' ? 'text-destructive' : event.type === 'complete' ? 'text-success' : 'text-muted-foreground'}`}>
              {event.message}
            </p>
          </div>
        )
      ))}

      {/* Display sections */}
      {Object.entries(sections).map(([title, items]) => (
        <div key={title} className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            {getEventIcon('action')}
            {title}
          </h3>
          <ul className="space-y-2 ml-6">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Show streaming indicator */}
      {isStreaming && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
          <div className="w-2 h-2 bg-primary rounded-full" />
          Streaming agent logs...
        </div>
      )}
    </div>
  );
}; 