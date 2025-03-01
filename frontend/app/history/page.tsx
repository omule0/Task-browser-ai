'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { HistoryList } from '@/components/history/history-list';
import { HistoryDetail } from '@/components/history/history-detail';
import { useToast } from "@/hooks/use-toast";
import { useHistory, useDeleteHistory, HistoryItem } from '@/hooks/useHistory';
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface PaginatedHistoryResponse {
  data: HistoryItem[];
  total: number;
}

export default function HistoryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const { toast } = useToast();

  const { 
    data, 
    isLoading, 
    isError, 
    error,
    isFetching,
  } = useHistory(currentPage, ITEMS_PER_PAGE) as {
    data: PaginatedHistoryResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
  };

  const deleteHistoryMutation = useDeleteHistory();

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Clear selection when changing pages
    setSelectedId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryMutation.mutateAsync(id);
      
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
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        {/* Error Message */}
        {isError && (
          <div className="bg-destructive/10 text-destructive px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base">
            {error instanceof Error ? error.message : 'An error occurred'}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* History List Card */}
          <Card className="order-2 lg:order-1 p-3 sm:p-4 lg:p-6 bg-card text-card-foreground border-border">
            <div className="flex flex-col h-full">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">Task History</h2>
              
              <div className="flex-1">
                <HistoryList
                  history={data?.data || []}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onDelete={handleDelete}
                  loading={isLoading || isFetching}
                />
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="h-8 sm:h-9 border-border text-foreground"
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8 sm:h-9 border-border text-foreground"
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* History Detail Card */}
          <Card className="order-1 lg:order-2 p-3 sm:p-4 lg:p-6 min-h-[300px] lg:min-h-[600px] bg-card text-card-foreground border-border">
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