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
  IconPhoto,
  IconListDetails,
  IconEye
} from '@tabler/icons-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SyncLoader } from 'react-spinners';
import { cn } from "@/lib/utils";
import { LiveView } from './live-view';

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif' | 'section' | 'run_id' | 'live_view_url' | 'document' | 'status';
  message?: string;
  success?: boolean;
  title?: string;
  items?: string[];
  url?: string;
}

interface AgentStepsProps {
  progress: ProgressEvent[];
  isStreaming?: boolean;
}

export const AgentSteps = ({ progress, isStreaming = false }: AgentStepsProps) => {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Record<number, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setEvents(progress);
    
    // Debug any live_view_url events
    const liveViewEvents = progress.filter(event => event.type === 'live_view_url');
    if (liveViewEvents.length > 0) {
      console.log('%cLive view URL events found:', 'background: #10b981; color: white; padding: 2px 4px; border-radius: 2px;', liveViewEvents);
    }
  }, [progress]);

  // Timer for running agent
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    
    if (isStreaming) {
      // Reset timer when agent starts
      setElapsedTime(0);
      
      // Start the timer
      timerId = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isStreaming]);

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
      case 'live_view_url':
        return <IconEye className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'document':
        return <IconListDetails className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
      case 'status':
        return <IconBrain className="w-3 h-3 sm:w-4 sm:h-4 text-background" />;
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
      case 'live_view_url':
        return 'bg-teal-500';
      case 'document':
        return 'bg-emerald-500';
      case 'status':
        return 'bg-blue-500';
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
      case 'live_view_url':
        return 'Live Browser View';
      case 'document':
        return 'Document Generation';
      case 'status':
        return 'Status Update';
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

  // Add function to check if event should be shown in steps
  const shouldShowEvent = (event: ProgressEvent) => {
    // Hide run_id events
    if (event.type === 'run_id') {
      return false;
    }
    
    // Always show most event types that have a message
    if (event.message && ['start', 'error', 'thought', 'action', 'document', 'status'].includes(event.type)) {
      return true;
    }
    
    // Always show URLs
    if (event.type === 'url') {
      return true;
    }
    
    // Show complete event at the end
    if (event.type === 'complete') {
      return true;
    }
    
    // Show live view URL
    if (event.type === 'live_view_url' && event.url) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="max-w-[100%] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-3xl border border-border/50 bg-card/50">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full text-left p-6 pb-3 relative"
          aria-label={isCollapsed ? "Expand steps" : "Collapse steps"}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <div className="triangle-loader-container relative">
                    <div className="triangle-dot-container animate-spin">
                      <div className="triangle-dot bg-primary"></div>
                      <div className="triangle-dot bg-primary"></div>
                      <div className="triangle-dot bg-primary"></div>
                    </div>
                  </div>
                ) : (
                  <IconListDetails size={22} className="text-foreground" />
                )}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-foreground">
                    {isStreaming ? "Thinking" : "Steps"}
                  </h3>
                  {isStreaming && (
                    <span className="text-sm text-muted-foreground">
                      {elapsedTime}s
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {isCollapsed ? (
                  <IconChevronDown className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <IconChevronUp className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </div>
            {!isCollapsed && (
              <span className="text-sm text-muted-foreground">
                Collapse details
              </span>
            )}
          </div>
        </button>

        {/* Show key events when collapsed */}
        {isCollapsed && events.length > 0 && (
          <div className="px-6 pb-6 relative">
            <div className="max-h-[150px] overflow-hidden relative">
              {(() => {
                // Helper function to sanitize message (remove user IDs)
                const sanitizeMessage = (message: string | undefined) => {
                  if (!message) return '';
                  // Remove user ID patterns and UUIDs from the message
                  return message
                    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'Starting task');
                };
                
                // Find events with messages and show the latest one
                const eventsWithMessages = events.filter(event => event.message);
                const latestEvent = eventsWithMessages.length > 0 
                  ? eventsWithMessages[eventsWithMessages.length - 1] 
                  : null;
                
                if (latestEvent) {
                  return (
                    <p className="text-base text-muted-foreground">
                      {sanitizeMessage(latestEvent.message)}
                    </p>
                  );
                }
                
                return null;
              })()}
              
              {/* Gradient backdrop overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card/95 to-transparent pointer-events-none"></div>
            </div>

            {/* Show live browser view buttons if available */}
            {(() => {
              const liveViewEvent = events.find(event => event.type === 'live_view_url' && event.url);
              if (liveViewEvent?.url && isStreaming) {
                return (
                  <div className="mt-3">
                    <LiveView url={liveViewEvent.url} />
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}

        {!isCollapsed && (
          <div className="px-6 pb-6 pt-0">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-4 relative pr-2 mt-2">
                {/* Stream individual events */}
                {events.filter(event => shouldShowEvent(event)).map((event, index) => (
                  <div 
                    key={`${event.type}-${index}`} 
                    className={cn(
                        "flex items-start gap-3 relative p-3 rounded-2xl transition-all duration-200",
                        expandedEvents[index] ? "bg-accent/40" : "hover:bg-accent/20"
                    )}
                    onClick={() => handleToggleEvent(index)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Toggle event ${getEventTitle(event.type)}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleToggleEvent(index)}
                  >
                    <div className={`w-5 h-5 rounded-full ${getEventColor(event.type)} flex items-center justify-center z-10 mt-1`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium mb-1 text-foreground">
                          {getEventTitle(event.type)}
                        </h4>
                      </div>
                      <p className={cn(
                          "text-xs text-muted-foreground transition-all duration-200",
                        expandedEvents[index] ? "line-clamp-none" : "line-clamp-2"
                      )}>
                        {event.message || (event.type === 'live_view_url' ? 'Live browser view available' : '')}
                      </p>
                      
                      {event.type === 'url' && event.url && (
                        <a 
                          href={event.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-blue-500 hover:underline mt-1 block"
                        >
                          {event.url}
                        </a>
                      )}
                      
                      {event.type === 'live_view_url' && event.url && isStreaming && (
                        <div className="mt-3">
                          <LiveView url={event.url} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Show streaming indicator */}
                {isStreaming && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-8 py-2">
                    <SyncLoader size={4} color="var(--primary)" margin={4} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
      
      {/* CSS for the triangle dot loader */}
      <style jsx>{`
        .triangle-loader-container {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .triangle-dot-container {
          position: relative;
          width: 18px;
          height: 18px;
        }
        
        .triangle-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        
        .triangle-dot:nth-child(1) {
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .triangle-dot:nth-child(2) {
          bottom: 0;
          left: 0;
        }
        
        .triangle-dot:nth-child(3) {
          bottom: 0;
          right: 0;
        }
      `}</style>
    </div>
  );
}; 