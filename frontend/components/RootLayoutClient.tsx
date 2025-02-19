'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import '../app/globals.css';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <>
      <div className="flex min-h-screen bg-background">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={setIsSidebarCollapsed} />
        <main className={cn(
          "flex-1 w-full transition-all duration-300",
          "md:ml-0", // Remove margin on desktop as sidebar is sticky
          isSidebarCollapsed ? "ml-[60px]" : "ml-[200px]" // Add margin on mobile to prevent overlap
        )}>
          {children}
        </main>
      </div>
      <Toaster />
    </>
  );
} 