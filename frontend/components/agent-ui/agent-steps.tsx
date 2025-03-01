import { useEffect, useState } from 'react';
import { 
  IconChevronUp,
  IconChevronDown,
  IconCircleCheck,
  IconAlertCircle,
  IconBrain,
  IconLink,
  IconRocket,
  IconTerminal,
  IconPhoto
} from '@tabler/icons-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SyncLoader } from 'react-spinners';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({});

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
      return (
        <div className="flex items-center gap-2">
          Agent is running <SyncLoader size={4} color="#2563eb" margin={4} />
        </div>
      );
    }
    const count = meaningfulEvents.length;
    return `Agent has completed: ${count} ${count === 1 ? 'step' : 'steps'}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'start':
        return <IconRocket className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'complete':
        return <IconCircleCheck className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'error':
        return <IconAlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'thought':
        return <IconBrain className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'url':
        return <IconLink className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'action':
        return <IconTerminal className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'gif':
        return <IconPhoto className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      default:
        return <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-background" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-destructive';
      case 'complete':
        return 'bg-success';
      case 'thought':
        return 'bg-purple-500';
      case 'url':
        return 'bg-amber-500';
      case 'action':
        return 'bg-indigo-500';
      case 'gif':
        return 'bg-pink-500';
      default:
        return 'bg-primary';
    }
  };

  const getEventTitle = (type: string) => {
    switch (type) {
      case 'complete':
        return 'Task Completion';
      case 'start':
        return 'Starting';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const handleToggleEvent = (index: number) => {
    setExpandedEvents(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="max-w-[100%] space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Completion Status Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center shadow-sm">
          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center transition-all ${isStreaming ? 'scale-110' : ''}`}>
            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-background ${isStreaming ? 'animate-pulse' : ''}`} />
          </div>
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-medium text-primary">
            {getStatusText()}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
            {isStreaming ? "The agent is actively processing information" : "All agent steps are complete"}
          </p>
        </div>
      </div>

      <div className="bg-background rounded-lg sm:rounded-xl shadow-sm border border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-medium text-primary">Steps</h3>
            <Badge variant="outline" className="bg-accent text-accent-foreground text-xs">
              {meaningfulEvents.length}
            </Badge>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-primary hover:text-primary/90 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
            aria-label={isCollapsed ? "Show all steps" : "Hide steps"}
          >
            {isCollapsed ? (
              <>
                Show all
                <IconChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            ) : (
              <>
                Hide all
                <IconChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <ScrollArea className="h-[300px] sm:h-[400px] px-4 sm:px-6 pb-3 sm:pb-4">
            <div className="space-y-3 sm:space-y-4 relative pr-3 sm:pr-4 pt-3">
              {/* Stream individual events */}
              {events.map((event, index) => (
                event.type !== 'section' && event.message && (
                  <div 
                    key={`${event.type}-${index}`} 
                    className={cn(
                      "flex items-start gap-2 sm:gap-3 relative p-2 rounded-lg transition-all duration-200",
                      expandedEvents[index] ? "bg-accent" : "hover:bg-accent/50"
                    )}
                    onClick={() => handleToggleEvent(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Toggle event ${getEventTitle(event.type)}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleToggleEvent(index)}
                  >
                    <div 
                      className="absolute left-[7px] sm:left-[9px] top-6 bottom-0 w-[2px] bg-border" 
                      style={{ display: index === events.length - 1 ? 'none' : 'block' }} 
                    />
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${getEventColor(event.type)} flex items-center justify-center z-10 mt-1 transition-transform ${expandedEvents[index] ? 'scale-110' : ''}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm sm:text-base font-medium mb-0.5 sm:mb-1" style={{ color: expandedEvents[index] ? 'var(--primary)' : 'var(--primary)' }}>
                          {getEventTitle(event.type)}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {
                            new Date().toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs sm:text-sm text-foreground transition-all duration-200",
                        expandedEvents[index] ? "line-clamp-none" : "line-clamp-2"
                      )}>
                        {event.message}
                      </p>
                    </div>
                  </div>
                )
              ))}

              {/* Show streaming indicator */}
              {isStreaming && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground pl-6 sm:pl-8 py-2 animate-pulse">
                  <SyncLoader size={4} color="var(--primary)" margin={4} />
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}; 