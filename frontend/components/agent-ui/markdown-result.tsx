import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { IconCopy, IconCheck, IconFileDownload } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from '@/utils/pdfGenerator';

interface MarkdownResultProps {
  content: string;
}

export const MarkdownResult = ({ content }: MarkdownResultProps) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to copy content",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      
      // Ensure the resultRef has an id for the PDF generator
      if (resultRef.current && !resultRef.current.id) {
        resultRef.current.id = 'agent-result-content';
      }
      
      // Generate PDF from the content div
      await generatePDF('agent-result-content', `agent-result-${new Date().toISOString().slice(0, 10)}`);
      
      toast({
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        variant: "destructive",
        description: "Failed to download PDF",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div 
        id="agent-result-content"
        ref={resultRef}
        className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none bg-white p-4 rounded-lg"
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          className="text-xs sm:text-sm text-muted-foreground"
          components={{
            p: ({children}) => <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{children}</p>,
            a: ({href, children}) => (
              <a 
                href={href} 
                className="text-primary hover:underline text-xs sm:text-sm" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            ul: ({children}) => <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 text-xs sm:text-sm">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-4 sm:pl-6 mb-3 sm:mb-4 text-xs sm:text-sm">{children}</ol>,
            li: ({children}) => <li className="mb-1 sm:mb-1.5">{children}</li>,
            h1: ({children}) => <h1 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{children}</h1>,
            h2: ({children}) => <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2">{children}</h3>,
            code: ({children}) => (
              <code className="bg-muted px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm">
                {children}
              </code>
            ),
            pre: ({children}) => (
              <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto mb-3 sm:mb-4 text-xs sm:text-sm">
                {children}
              </pre>
            ),
            blockquote: ({children}) => (
              <blockquote className="border-l-2 sm:border-l-4 border-primary/10 pl-3 sm:pl-4 italic mb-3 sm:mb-4 text-xs sm:text-sm">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
          onClick={handleDownloadPDF}
          disabled={downloading}
          aria-label="Download as PDF"
        >
          <IconFileDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
          onClick={handleCopy}
          aria-label="Copy content"
        >
          {copied ? (
            <IconCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
          ) : (
            <IconCopy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
          )}
        </Button>
      </div>
    </div>
  );
}; 