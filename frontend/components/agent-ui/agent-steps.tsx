import { useEffect, useState } from 'react';
import { 
  IconChevronUp,
  IconChevronDown,
} from '@tabler/icons-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif' | 'section' | 'run_id';
  message?: string;
  success?: boolean;
  title?: string;
  items?: string[];
}

interface AgentStepsProps {
  progress: ProgressEvent[];
  isStreaming?: boolean;
}

export const AgentSteps = ({ progress, isStreaming = false }: AgentStepsProps) => {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    setEvents(progress);
  }, [progress]);

  // Count meaningful events (excluding section and run_id types)
  const meaningfulEvents = events.filter(event => 
    event.type !== 'section' && 
    event.type !== 'run_id' && 
    event.message
  );

  const getStatusText = () => {
    if (isStreaming) {
      return "Agent is running...";
    }
    const count = meaningfulEvents.length;
    return `Agent has completed: ${count} ${count === 1 ? 'step' : 'steps'}`;
  };

  return (
    <div className="max-w-[100%] space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {/* Completion Status Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#F4F9F9] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full bg-white ${isStreaming ? 'animate-pulse' : ''}`} />
          </div>
        </div>
        <h2 className="text-lg font-medium text-blue-500">
          {getStatusText()}
        </h2>
      </div>

      <div className="bg-[#F4F9F9] rounded-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-blue-500 text-lg font-medium">Steps</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            aria-label={isCollapsed ? "Show all steps" : "Hide steps"}
          >
            {isCollapsed ? (
              <>
                Show all
                <IconChevronDown size={20} />
              </>
            ) : (
              <>
                Hide all
                <IconChevronUp size={20} />
              </>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <ScrollArea className="h-[400px] px-6 pb-4">
            <div className="space-y-4 relative pr-4">
              {/* Stream individual events */}
              {events.map((event, index) => (
                event.type !== 'section' && event.message && (
                  <div key={`${event.type}-${index}`} className="flex items-start gap-3 relative">
                    <div className="absolute left-[9px] top-5 bottom-0 w-[2px] bg-blue-100" 
                         style={{ display: index === events.length - 1 ? 'none' : 'block' }} />
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center z-10">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-blue-500 font-medium mb-1">
                        {event.type === 'complete' ? 'Task Completion' : 
                         event.type === 'start' ? 'Starting' : 
                         event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {event.message}
                      </p>
                    </div>
                  </div>
                )
              ))}

              {/* Show streaming indicator */}
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-gray-600 pl-8">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Agent is running...
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}; 