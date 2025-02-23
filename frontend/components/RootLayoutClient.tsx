'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import '../app/globals.css';

interface RootLayoutClientProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function RootLayoutClient({ children, onReset }: RootLayoutClientProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <>
      <Header 
        isCollapsed={isSidebarCollapsed} 
        onToggle={setIsSidebarCollapsed}
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
    </>
  );
} 