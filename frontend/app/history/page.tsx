'use client';

import { useState, useEffect } from 'react';
import { HistoryList } from '@/components/history/history-list';
import { HistoryDetail } from '@/components/history/history-detail';
import { useToast } from "@/hooks/use-toast";
import { useHistory, useDeleteHistory, HistoryItem } from '@/hooks/useHistory';
import { Button } from "@/components/ui/button";
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconClipboardList 
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

interface PaginatedHistoryResponse {
  data: HistoryItem[];
  total: number;
}

export default function HistoryPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const { toast } = useToast();

  // Check if we're on mobile screen
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 1024);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
    <div className="container px-4 py-0 mx-auto ">
      {/* Page Header */}
      <div className="flex items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <IconClipboardList className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Task History</h1>
        </div>
        
        {/* Mobile Navigation Controls */}
        {isMobile && selectedId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedId(null)}
            className="ml-auto"
          >
            <IconChevronLeft className="mr-1 h-4 w-4" />
            Back to list
          </Button>
        )}
      </div>

      {/* Error Message */}
      {isError && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <p className="text-sm font-medium">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className={`bg-card rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${selectedId && isMobile ? 'lg:grid lg:grid-cols-2' : 'lg:grid lg:grid-cols-2'}`}>
        {/* Left Column - History List */}
        <div className={`border-b lg:border-b-0 lg:border-r ${selectedId && isMobile ? 'hidden lg:block' : 'block'}`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium">
                {data?.total || 0} Task{data?.total !== 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
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
              <div className="p-4 border-t bg-background/50">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - History Detail */}
        <div className={`${selectedId || !isMobile ? 'block' : 'hidden'}`}>
          <div className="h-full flex flex-col">
            <HistoryDetail
              historyId={selectedId}
              onClose={() => setSelectedId(null)}
            />
            
            {/* Empty state when no history data is available */}
            {data?.data.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center max-w-sm"
                >
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10">
                    <IconClipboardList className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="mb-2 text-xl font-bold">No History Yet</h2>
                  <p className="text-muted-foreground">
                    When you run tasks, your history will be displayed here.
                  </p>
                </motion.div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                  
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-40 w-full rounded-lg" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 