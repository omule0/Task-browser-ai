'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function HistoryLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-muted" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 bg-muted" />
            <Skeleton className="h-8 w-16 bg-muted" />
            <Skeleton className="h-8 w-8 bg-muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 bg-card text-card-foreground border-border">
            <Skeleton className="h-6 w-32 mb-4 bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5">
                  <Skeleton className="h-4 w-4 mt-1 bg-muted" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2 bg-muted" />
                    <Skeleton className="h-3 w-1/4 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-card text-card-foreground border-border">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-24 bg-muted" />
              <Skeleton className="h-8 w-8 bg-muted" />
            </div>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-16 mb-2 bg-muted" />
                <Skeleton className="h-4 w-full bg-muted" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2 bg-muted" />
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full bg-muted" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2 bg-muted" />
                <Skeleton className="h-32 w-full bg-muted" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}