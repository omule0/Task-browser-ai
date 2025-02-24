'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { HistoryList } from '@/components/history/history-list';
import { HistoryDetail } from '@/components/history/history-detail';
import { useToast } from "@/hooks/use-toast";
import { useHistory, useDeleteHistory } from '@/hooks/useHistory';


export default function HistoryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const LIMIT = 10;
  const { toast } = useToast();

  const { 
    data: history = [], 
    isLoading, 
    isError, 
    error 
  } = useHistory();

  const deleteHistoryMutation = useDeleteHistory();

  const hasMore = history.length === LIMIT;

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryMutation.mutateAsync(id);
      
      // If the deleted item was selected, clear the selection
      if (selectedId === id) {
        setSelectedId(null);
      }

      toast({
        title: "Success",
        description: "History item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete history item',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-end">
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

        {isError && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md">
            {error instanceof Error ? error.message : 'An error occurred'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <HistoryList
              history={history}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              loading={isLoading}
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