"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ChevronDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  onNewChat
}) {
  const handleQuestionClick = (question) => {
    handleSendMessage(question);
    setIsQuestionsCollapsed(true);
  };

  const renderMessageContent = (message) => {
    if (message.role === 'assistant' && message.citations) {
      return (
        <div>
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
                    className="text-sm bg-secondary/50 p-3 rounded-lg border border-border"
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
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold">Chat</h2>
        <Button 
          variant="ghost"
          size="sm"
          onClick={onNewChat}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={cn(
                "flex gap-3 rounded-lg p-4",
                message.role === 'assistant' 
                  ? 'bg-secondary/50 border border-border' 
                  : 'bg-primary/10'
              )}
            >
              <div 
                className={cn(
                  "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center",
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
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ScrollArea>

      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <button 
            onClick={() => setIsQuestionsCollapsed(!isQuestionsCollapsed)}
            className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground mb-2 hover:text-foreground"
          >
            <span>Suggested Questions</span>
            <ChevronDown 
              className={cn(
                "h-4 w-4 transition-transform",
                isQuestionsCollapsed ? "rotate-180" : ""
              )} 
            />
          </button>
          <div className={cn(
            "space-y-1.5 transition-all duration-200 overflow-hidden",
            isQuestionsCollapsed ? "h-0" : "h-auto"
          )}>
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors"
                onClick={() => handleQuestionClick(question)}
                disabled={isLoading}
              >
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="line-clamp-2">{question}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="relative">
          <Input
            placeholder="Ask a question about the document..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || !selectedFile}
            className="pr-12"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Button
              size="icon"
              variant="ghost"
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
    </div>
  );
} 