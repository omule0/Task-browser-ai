import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownResultProps {
  content: string;
}

export const MarkdownResult = ({ content }: MarkdownResultProps) => (
  <div className="space-y-4">
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        className="text-sm text-muted-foreground"
        components={{
          p: ({children}) => <p className="text-sm text-muted-foreground mb-4">{children}</p>,
          a: ({href, children}) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
          ul: ({children}) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
          li: ({children}) => <li className="mb-1">{children}</li>,
          h1: ({children}) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-semibold mb-3">{children}</h2>,
          h3: ({children}) => <h3 className="text-base font-medium mb-2">{children}</h3>,
          code: ({children}) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>,
          pre: ({children}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
          blockquote: ({children}) => <blockquote className="border-l-4 border-primary/10 pl-4 italic mb-4">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  </div>
); 