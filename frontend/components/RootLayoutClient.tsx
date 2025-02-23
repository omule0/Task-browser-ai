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
  onReset?: () => void;
}

// Create a singleton instance for sidebar state
let sidebarInstance: { isCollapsed: boolean } | null = null;

export function RootLayoutClient({ children, onReset }: RootLayoutClientProps) {
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
        onReset={onReset}
      />
      <div className="flex min-h-screen bg-background">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className={cn(
          "flex-1 w-full transition-all duration-300",
          isSidebarCollapsed ? "ml-0" : "ml-[200px]"
        )}>
          {children}
        </main>
      </div>
      <Toaster />
    </Providers>
  );
} 