'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="p-8 flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <IconAlertTriangle size={32} className="text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Something Went Wrong</h1>
          <p className="text-muted-foreground max-w-md">
            We apologize for the inconvenience. An error occurred while processing your request.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.refresh()}
            className="gap-2"
          >
            <IconRefresh size={16} />
            Try Again
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <IconHome size={16} />
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}

