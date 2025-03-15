'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TaskDetailContent } from '@/components/history/task-detail-content';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertTriangle } from '@tabler/icons-react';
import Image from 'next/image';
import { useHistoryDetail } from '@/hooks/useHistory';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ModernTabs } from '@/components/ui/modern-tabs';
import { FileText, Play } from 'lucide-react';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { 
    data,
    isLoading,
    isError,
    error
  } = useHistoryDetail(taskId || '');
  
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Modern tabs configuration
  const tabs = [
    { id: "details", label: "Details", icon: <FileText className="h-4 w-4" /> },
    { id: "recording", label: "Recording", icon: <Play className="h-4 w-4" /> },
  ];

  // Render content based on active tab
  const renderTabContent = (tabId: string) => {
    if (tabId === "details") {
      return <TaskDetailContent historyId={taskId} />;
    } else if (tabId === "recording") {
      return (
        <div className="p-5 h-full">
          <Card className="border shadow-sm bg-card h-full flex flex-col">
            <CardHeader className="pb-2">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">Task Recording</h2>
              <p className="text-xs text-muted-foreground">Visual representation of the task execution</p>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0 sm:p-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 p-6 w-full">
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-5 w-4/5 mx-auto" />
                    <Skeleton className="h-4 w-2/3 mx-auto" />
                    <div className="flex justify-center gap-2 pt-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-3 rounded-full" />
                    </div>
                  </div>
                </div>
              ) : isError ? (
                <div className="flex items-center justify-center p-6 w-full">
                  <Alert variant="destructive" className="max-w-[340px] sm:max-w-md">
                    <IconAlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <AlertTitle className="text-sm sm:text-base">Error Loading Recording</AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm">
                      {error instanceof Error ? error.message : 'An error occurred'}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : data?.gif_content ? (
                <div className="w-full h-full p-2 sm:p-4">
                  <div className="rounded-lg overflow-hidden border bg-white shadow-sm h-full flex items-center justify-center">
                    <Image
                      src={`data:image/gif;base64,${data.gif_content}`}
                      alt="Task Recording"
                      width={800}
                      height={900}
                      className="w-full h-auto object-contain max-h-[80vh]"
                      priority
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 w-full gap-2">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                    <IconAlertTriangle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground text-center">
                    No recording available for this task
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  };

  // Mobile view with modern tabs
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
        <ModernTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
          renderContent={renderTabContent}
          className="h-full flex flex-col"
          contentClassName="mt-0 overflow-auto"
        />
      </div>
    );
  }

  // Desktop view with resizable panels
  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full rounded-md"
      >
        {/* Left Panel - Task Details */}
        <ResizablePanel 
          defaultSize={60} 
          minSize={40}
          className="overflow-auto"
        >
          <TaskDetailContent historyId={taskId} />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right Panel - GIF Recording */}
        <ResizablePanel 
          defaultSize={40} 
          minSize={30}
          className="overflow-auto bg-muted/5"
        >
          <div className="p-5 h-full">
            <Card className="border shadow-sm bg-card h-full flex flex-col">
              <CardHeader className="pb-2">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Task Recording</h2>
                <p className="text-xs text-muted-foreground">Visual representation of the task execution</p>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center p-0 sm:p-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-6 w-full">
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                    <div className="space-y-3 w-full">
                      <Skeleton className="h-5 w-4/5 mx-auto" />
                      <Skeleton className="h-4 w-2/3 mx-auto" />
                      <div className="flex justify-center gap-2 pt-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-3 rounded-full" />
                      </div>
                    </div>
                  </div>
                ) : isError ? (
                  <div className="flex items-center justify-center p-6 w-full">
                    <Alert variant="destructive" className="max-w-[340px] sm:max-w-md">
                      <IconAlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <AlertTitle className="text-sm sm:text-base">Error Loading Recording</AlertTitle>
                      <AlertDescription className="text-xs sm:text-sm">
                        {error instanceof Error ? error.message : 'An error occurred'}
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : data?.gif_content ? (
                  <div className="w-full h-full p-2 sm:p-4">
                    <div className="rounded-lg overflow-hidden border bg-white shadow-sm h-full flex items-center justify-center">
                      <Image
                        src={`data:image/gif;base64,${data.gif_content}`}
                        alt="Task Recording"
                        width={800}
                        height={900}
                        className="w-full h-auto object-contain max-h-[80vh]"
                        priority
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 w-full gap-2">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <IconAlertTriangle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground text-center">
                      No recording available for this task
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
} 