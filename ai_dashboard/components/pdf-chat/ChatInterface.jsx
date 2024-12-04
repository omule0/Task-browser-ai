"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ChevronDown, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChatInterface({
  messages,
  isLoading,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  suggestedQuestions,
  isQuestionsCollapsed,
  setIsQuestionsCollapsed,
  selectedFile
}) {
  const handleQuestionClick = (question) => {
    handleSendMessage(question);
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
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Sources:</h4>
              <div className="space-y-2">
                {message.citations.map((citation) => (
                  <div 
                    key={citation.id}
                    className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                  >
                    <span className="font-medium text-gray-700">[{citation.id}]</span>
                    <span className="ml-2">{citation.text.substring(0, 150)}...</span>
                    <div className="text-xs text-gray-500 mt-1">
                      Location: {citation.location}
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
    <div className="flex-1 border-l border-gray-200 bg-white flex flex-col">
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
        <h2 className="font-semibold">Chat</h2>
        <Button 
          size="sm"
          variant="ghost"
          className="gap-2 text-sm"
        >
          <Plus size={14} />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={cn(
                "flex gap-2 rounded-lg p-3",
                message.role === 'assistant' ? 'bg-gray-100' : 'bg-purple-50'
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-lg flex-shrink-0",
                  message.role === 'assistant' ? 'bg-purple-600' : 'bg-purple-400'
                )}
              />
              <div className="flex-1">
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </ScrollArea>

      {suggestedQuestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <button 
            onClick={() => setIsQuestionsCollapsed(!isQuestionsCollapsed)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-500 mb-2 hover:text-gray-700"
          >
            <span>Suggested Questions</span>
            <ChevronDown 
              size={16} 
              className={cn(
                "transition-transform duration-200",
                isQuestionsCollapsed ? "rotate-180" : ""
              )}
            />
          </button>
          <div className={cn(
            "space-y-1.5 transition-all duration-200 overflow-hidden",
            isQuestionsCollapsed ? "h-0" : "h-auto"
          )}>
            {suggestedQuestions.map((question, index) => (
              <TooltipProvider key={index} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => handleQuestionClick(question)}
                      disabled={isLoading}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        <span className="line-clamp-2">{question}</span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="left" 
                    className="max-w-[300px] break-words"
                  >
                    {question}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <Input
            placeholder="Ask any question..."
            className="pr-20 bg-gray-100 border-gray-300"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || !selectedFile}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-purple-600"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !selectedFile || !inputMessage.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 