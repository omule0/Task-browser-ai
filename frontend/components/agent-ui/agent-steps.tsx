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
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif' | 'section';
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
      return <IconX size={18} className="inline-block" />;
    case 'complete':
      return <IconCheck size={18} className="inline-block" />;
    case 'gif':
      return <IconVideo size={18} className="inline-block" />;
    default:
      return null;
  }
};

interface AgentStepsProps {
  progress: ProgressEvent[];
}

export const AgentSteps = ({ progress }: AgentStepsProps) => {
  const sections = progress.reduce((acc: { [key: string]: string[] }, event) => {
    if (event.type === 'section' && event.title && event.items) {
      acc[event.title] = event.items;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([title, items]) => (
        <div key={title} className="space-y-2">
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
    </div>
  );
}; 