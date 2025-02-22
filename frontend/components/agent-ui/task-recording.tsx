import Image from 'next/image';
import { IconPlayerPlay, IconDownload } from '@tabler/icons-react';
import { Button } from "@/components/ui/button";

interface TaskRecordingProps {
  gifContent: string | undefined;
  isAgentRunning?: boolean;
}

export const TaskRecording = ({ gifContent, isAgentRunning }: TaskRecordingProps) => {
  if (!gifContent && !isAgentRunning) return null;
  
  const handleDownload = () => {
    if (!gifContent) return;
    
    // Create a Blob from the base64 string
    const byteCharacters = atob(gifContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/gif' });
    
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-recording.gif';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (isAgentRunning && !gifContent) {
    return (
      <div className="relative">
        <div className="w-full aspect-video bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <IconPlayerPlay size={24} className="text-blue-500 ml-1" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">Recording in Progress</p>
              <p className="text-sm text-gray-500 mt-1">The task recording will appear here once the agent completes its work</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-full h-full relative">
          <Image 
            src={`data:image/gif;base64,${gifContent}`}
            alt="Task Recording"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            priority
          />
          {gifContent && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleDownload}
              aria-label="Download recording"
            >
              <IconDownload size={18} className="text-gray-700" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 