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
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Sources:</h4>
              <div className="space-y-2">
                {message.citations.map((citation) => (
                  <div 
                    key={citation.id}
                    className="text-sm bg-secondary/50 p-3 rounded-lg border border-border cursor-pointer hover:bg-secondary/70 transition-colors"
                    onClick={() => onSourceClick(citation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-medium">
                        Source {citation.id}
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground line-clamp-2">
                          {citation.text.length > 250 
                            ? `${citation.text.substring(0, 250)}...` 
                            : citation.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
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
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex-1 border-l border-border bg-background flex flex-col">
      <header className="h-14 border-b border-border flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold">Chat</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={onNewChat}
          >
            <Plus className="mr-2 h-4 w-4" />
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
              className="flex gap-4"
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
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
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">
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
            className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground mb-2 hover:text-foreground"
          >
            <span>Suggested Questions</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isQuestionsCollapsed ? "rotate-180" : ""
            )} />
          </button>
          <div className={cn(
            "space-y-2 transition-all duration-200",
            isQuestionsCollapsed ? "h-0 overflow-hidden" : "h-auto"
          )}>
            {suggestedQuestions.map((question, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 text-primary cursor-pointer hover:text-primary/80"
                onClick={() => handleQuestionClick(question)}
              >
                <ArrowRight className="h-4 w-4" />
                <p className="text-sm">{question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
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
            className="flex-1 text-sm"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !selectedFile || !inputMessage.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 