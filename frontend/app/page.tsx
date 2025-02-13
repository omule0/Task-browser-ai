'use client';

import { useState } from 'react';

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif';
  message: string;
  success?: boolean;
}

export default function Home() {
  const [task, setTask] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress([]);
    setGifUrl(null);

    try {
      const response = await fetch('http://localhost:8000/api/browse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split('\n').filter(Boolean);

        for (const eventText of events) {
          try {
            const event: ProgressEvent = JSON.parse(eventText);
            setProgress(prev => [...prev, event]);

            if (event.type === 'complete') {
              setResult(event.message);
              setLoading(false);
            } else if (event.type === 'error') {
              setError(event.message);
              setLoading(false);
            } else if (event.type === 'gif') {
              setGifUrl(`http://localhost:8000${event.message}`);
            }
          } catch (e) {
            console.error('Failed to parse event:', e);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold mb-8">Browser Automation</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="task" className="block text-sm font-medium mb-2">
              Enter your task:
            </label>
            <textarea
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full p-3 border rounded-lg min-h-[100px] text-black"
              placeholder="Example: go to https://example.com and extract all article titles"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 'Run Task'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}

        {progress.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Progress:</h2>
            <div className="space-y-2">
              {progress.map((event, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    event.type === 'error'
                      ? 'bg-red-100 text-red-700'
                      : event.type === 'complete'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="font-medium">
                    {event.type === 'start' && '🚀 '}
                    {event.type === 'url' && '🌐 '}
                    {event.type === 'action' && '🎯 '}
                    {event.type === 'thought' && '💭 '}
                    {event.type === 'error' && '❌ '}
                    {event.type === 'complete' && '✅ '}
                    {event.type === 'gif' && '🎥 '}
                  </span>
                  {event.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {gifUrl && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Task Recording:</h2>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img src={gifUrl} alt="Task Recording" className="w-full" />
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Final Result:</h2>
            <div className="p-4 bg-green-100 rounded-lg whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
