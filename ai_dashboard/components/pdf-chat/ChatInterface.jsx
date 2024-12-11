"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ChevronDown, Loader2, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ModeToggle } from "@/components/mode-toggle";

export function ChatInterface({
  messages,
  isLoading,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  suggestedQuestions,
  isQuestionsCollapsed,
  setIsQuestionsCollapsed,
  selectedFile,
  onNewChat,
  loadingMessage,
  onSourceClick,
}) {
  const handleQuestionClick = (question) => {
    handleSendMessage(question);
    setIsQuestionsCollapsed(true);
  };

  const renderMessageContent = (message) => {
    if (message.role === 'assistant' && message.citations) {
      return (
        <div className="space-y-4">
          <div className="prose dark:prose-invert prose-sm max-w-none [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Sources:"click source to view them on pdf"</h4>
              <div className="space-y-1.5">
                {message.citations.map((citation) => (
                  <div 
                    key={citation.id}
                    className="text-xs bg-secondary/50 p-2 rounded-lg border border-border cursor-pointer hover:bg-secondary/70 transition-colors"
                    onClick={() => onSourceClick(citation)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="bg-primary text-primary-foreground rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                        Source {citation.id}
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground line-clamp-2">
                          {citation.text.length > 250 
                            ? `${citation.text.substring(0, 250)}...` 
                            : citation.text}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Location: {citation.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="prose dark:prose-invert prose-sm max-w-none [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex-1 border-l border-border bg-background flex flex-col">
      <header className="h-14 border-b border-border flex items-center justify-between px-4">
        <h1 className="text-base font-semibold">Chat</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="text-xs"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Chat
          </Button>
          <ModeToggle />
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div 
              key={index}
              className="flex gap-3"
            >
              <div 
                className={cn(
                  "w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-xs",
                  message.role === 'assistant' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-primary/80 text-primary-foreground'
                )}
              >
                {message.role === 'assistant' ? 'AI' : 'You'}
              </div>
              <div className="flex-1">
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          {(isLoading || loadingMessage) && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-1.5" />
              <p className="text-xs text-muted-foreground">
                {loadingMessage || 'Processing...'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-secondary/10">
          <button 
            onClick={() => setIsQuestionsCollapsed(!isQuestionsCollapsed)}
            className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5 hover:text-foreground"
          >
            <span>Suggested Questions</span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 transition-transform",
              isQuestionsCollapsed ? "rotate-180" : ""
            )} />
          </button>
          <div className={cn(
            "space-y-1.5 transition-all duration-200",
            isQuestionsCollapsed ? "h-0 overflow-hidden" : "h-auto"
          )}>
            {suggestedQuestions.map((question, index) => (
              <div 
                key={index}
                className="flex items-center gap-1.5 text-primary cursor-pointer hover:text-primary/80"
                onClick={() => handleQuestionClick(question)}
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <p className="text-xs">{question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-border">
        <div className="flex gap-1.5">
          <Input
            placeholder={selectedFile ? "Ask any question..." : "Select a PDF to start chatting..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || !selectedFile}
            className="flex-1 text-xs h-8"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !selectedFile || !inputMessage.trim()}
            className="h-8 w-8"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 