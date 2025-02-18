'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <html lang="en">
      <body >
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
      </body>
    </html>
  );
}
