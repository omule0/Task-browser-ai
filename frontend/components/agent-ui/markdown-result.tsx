import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { IconCopy, IconCheck, IconFileDownload } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from '@/utils/pdfGenerator';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="space-y-4 sm:space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        id="agent-result-content"
        ref={resultRef}
        className="prose prose-sm dark:prose-invert max-w-none bg-card p-5 rounded-xl border border-border shadow-sm"
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          className="text-sm text-foreground"
          components={{
            p: ({children}) => <p className="text-sm text-foreground/90 mb-4 leading-relaxed">{children}</p>,
            a: ({href, children}) => (
              <a 
                href={href} 
                className="text-primary font-medium hover:underline transition-colors duration-200 text-sm" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            ul: ({children}) => <ul className="list-disc pl-6 mb-4 text-sm space-y-1">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-6 mb-4 text-sm space-y-1">{children}</ol>,
            li: ({children}) => <li className="mb-1 text-foreground/80">{children}</li>,
            h1: ({children}) => (
              <h1 className="text-xl font-bold mb-4 text-foreground border-b pb-2 border-border/50">
                {children}
              </h1>
            ),
            h2: ({children}) => (
              <h2 className="text-lg font-semibold mb-3 text-foreground mt-6 border-b pb-1 border-border/30">
                {children}
              </h2>
            ),
            h3: ({children}) => (
              <h3 className="text-base font-medium mb-2 text-foreground mt-5">
                {children}
              </h3>
            ),
            code: ({children}) => (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary/90">
                {children}
              </code>
            ),
            pre: ({children}) => (
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm font-mono border border-border/50 shadow-sm">
                {children}
              </pre>
            ),
            blockquote: ({children}) => (
              <blockquote className="border-l-4 border-primary/30 pl-4 italic mb-4 text-sm text-foreground/70 bg-muted/30 py-2 rounded-r">
                {children}
              </blockquote>
            ),
            table: ({children}) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({children}) => <thead className="bg-muted/50 border-b border-border">{children}</thead>,
            tbody: ({children}) => <tbody className="divide-y divide-border/50">{children}</tbody>,
            tr: ({children}) => <tr>{children}</tr>,
            th: ({children}) => (
              <th className="px-4 py-2 text-left font-medium text-foreground">
                {children}
              </th>
            ),
            td: ({children}) => (
              <td className="px-4 py-2 text-foreground/80">
                {children}
              </td>
            ),
            hr: () => <hr className="border-border/50 my-6" />,
            img: ({src, alt}) => (
              <img 
                src={src} 
                alt={alt} 
                className="rounded-lg max-w-full h-auto border border-border/50 shadow-sm my-4" 
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <motion.div 
        className="flex justify-end space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-background border-border hover:bg-accent hover:text-primary hover:border-primary/20 transition-colors duration-200"
          onClick={handleDownloadPDF}
          disabled={downloading}
          aria-label="Download as PDF"
        >
          <IconFileDownload className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-background border-border hover:bg-accent hover:text-primary hover:border-primary/20 transition-colors duration-200"
          onClick={handleCopy}
          aria-label="Copy content"
        >
          {copied ? (
            <IconCheck className="w-4 h-4 text-emerald-500" />
          ) : (
            <IconCopy className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}; 