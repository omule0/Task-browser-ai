'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/app/providers";
import '../app/globals.css';

interface RootLayoutClientProps {
  children: React.ReactNode;
}

// Create a singleton instance for sidebar state
let sidebarInstance: { isCollapsed: boolean } | null = null;

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (!sidebarInstance) {
      sidebarInstance = { isCollapsed: true };
    }
    return sidebarInstance.isCollapsed;
  });

  const handleSidebarToggle = (value: boolean) => {
    setIsSidebarCollapsed(value);
    if (sidebarInstance) {
      sidebarInstance.isCollapsed = value;
    }
  };

  return (
    <Providers>
      <Header 
        isCollapsed={isSidebarCollapsed} 
        onToggle={handleSidebarToggle}
      />
      <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-background">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className={cn(
          "flex-1 w-full transition-all duration-300 ease-in-out",
          isSidebarCollapsed 
            ? "ml-0" 
            : "ml-[180px] sm:ml-[200px]"
        )}>
          <div className="h-full px-3 sm:px-4 py-3 sm:py-4">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </Providers>
  );
} 