import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { IconEye, IconExternalLink } from '@tabler/icons-react';

interface LiveViewProps {
  url: string;
}

export function LiveView({ url }: LiveViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openInNewTab = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => setIsOpen(true)} 
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1.5 h-8 px-3 rounded-lg"
        >
          <IconEye className="w-3.5 h-3.5" />
          <span>View Browser</span>
        </Button>
        
        <Button 
          onClick={openInNewTab} 
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1.5 h-8 px-3 rounded-lg"
        >
          <IconExternalLink className="w-3.5 h-3.5" />
          <span>Open in New Tab</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <iframe 
            src={url} 
            sandbox="allow-same-origin allow-scripts" 
            allow="clipboard-read; clipboard-write" 
            className="w-full h-full border-0"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 