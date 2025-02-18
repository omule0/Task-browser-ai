'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { HistoryList } from '@/components/history/history-list';
import { HistoryDetail } from '@/components/history/history-detail';
import { createClient } from '@/utils/supabase/client';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const LIMIT = 10;
  const supabase = createClient();

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to view history');
      }

      const response = await fetch(
        `http://localhost:8000/api/history?limit=${LIMIT}&offset=${page * LIMIT}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      
      const data = await response.json();
      setHistory(data);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Run History</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <IconChevronLeft size={16} />
            </Button>
            <span className="text-sm">Page {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
            >
              <IconChevronRight size={16} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <HistoryList
              history={history}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loading={loading}
            />
          </Card>

          <Card className="p-4">
            <HistoryDetail
              historyId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
} 