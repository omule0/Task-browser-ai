interface TaskRecordingProps {
  gifUrl: string;
}

export const TaskRecording = ({ gifUrl }: TaskRecordingProps) => (
  <div className="mt-6">
    <h3 className="text-sm font-medium mb-3">Task Recording</h3>
    <div className="rounded-lg overflow-hidden border">
      <img 
        src={gifUrl} 
        alt="Task Recording" 
        className="w-full"
        key={gifUrl}
      />
    </div>
  </div>
); 