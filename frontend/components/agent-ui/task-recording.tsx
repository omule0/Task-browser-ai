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
        <div className="w-full aspect-video bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 flex items-center justify-center p-4 sm:p-6">
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-gray-500">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <IconPlayerPlay className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 ml-0.5 sm:ml-1" />
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base font-medium text-gray-700">Recording in Progress</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">The task recording will appear here once the agent completes its work</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-full h-full relative rounded-lg sm:rounded-xl overflow-hidden">
          <Image 
            src={`data:image/gif;base64,${gifContent}`}
            alt="Task Recording"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain"
            priority
          />
          {gifContent && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 sm:top-4 right-2 sm:right-4 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 hover:bg-white shadow-md sm:shadow-lg hover:shadow-lg sm:hover:shadow-xl transition-all duration-200"
              onClick={handleDownload}
              aria-label="Download recording"
            >
              <IconDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 