import Image from 'next/image';

interface TaskRecordingProps {
  gifContent?: string;
}

export const TaskRecording = ({ gifContent }: TaskRecordingProps) => {
  if (!gifContent) {
    console.warn('TaskRecording: No GIF content provided');
    return null;
  }

  console.log('TaskRecording: Rendering GIF with content length:', gifContent.length);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-3">Task Recording</h3>
      <div className="rounded-lg overflow-hidden border">
        <Image 
          src={`data:image/gif;base64,${gifContent}`}
          alt="Task Recording"
          width={800}
          height={800}
          className="w-full h-auto"
          key={gifContent}
          onError={(e) => {
            console.error('Error loading GIF:', e);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
          onLoad={() => {
            console.log('TaskRecording: GIF loaded successfully');
          }}
        />
      </div>
    </div>
  );
}; 