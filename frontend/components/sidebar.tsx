'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconUser,
  IconMessage,
} from '@tabler/icons-react';
import { TaskHistorySidebar } from './history/task-history-sidebar';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const sidebarItems: SidebarItem[] = [];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed top-14 sm:top-16 left-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-sidebar border-sidebar-border flex flex-col items-center py-3 sm:py-4 gap-1.5 sm:gap-2 transition-all duration-300 z-40",
        isCollapsed ? "-translate-x-full" : "translate-x-0",
        "w-[180px] sm:w-[200px]"
      )}
    >
      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 w-full px-1.5 sm:px-2">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-3 sm:gap-4 justify-start px-2",
                "h-8 sm:h-10 rounded-lg text-xs sm:text-sm text-sidebar-foreground",
                isActive 
                  ? "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/15" 
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              asChild
            >
              <Link href={item.href}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-4 h-4 sm:w-5 sm:h-5">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              </Link>
            </Button>
          );
        })}

        {/* Task History Section */}
        <div className="mt-3 sm:mt-4">
          <TaskHistorySidebar isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* Bottom Items */}
      <div className="flex flex-col gap-1.5 sm:gap-2 w-full px-1.5 sm:px-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 sm:gap-4 justify-start px-2",
            "h-8 sm:h-10 rounded-lg text-xs sm:text-sm text-sidebar-foreground",
            pathname === '/profile' 
              ? "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/15"
              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          asChild
        >
          <Link href="/profile">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-4 h-4 sm:w-5 sm:h-5">
                <IconUser />
              </div>
              <span>Profile</span>
            </div>
          </Link>
        </Button>
        
        {/* Feedback Link */}
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-3 sm:gap-4 justify-start px-2",
            "h-8 sm:h-10 rounded-lg text-xs sm:text-sm text-sidebar-foreground",
            pathname === '/feedback' 
              ? "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/15"
              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          asChild
        >
          <Link href="/feedback">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-4 h-4 sm:w-5 sm:h-5">
                <IconMessage />
              </div>
              <span>Feedback</span>
            </div>
          </Link>
        </Button>
      </div>
    </aside>
  );
} 