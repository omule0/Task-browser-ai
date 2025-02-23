'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconUser,
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
        "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-background border-r flex flex-col items-center py-4 gap-2 transition-all duration-300 z-40",
        isCollapsed ? "-translate-x-full" : "translate-x-0",
        "w-[200px]"
      )}
    >
      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2 w-full px-2">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-4 justify-start px-2",
                "h-10 rounded-lg",
                isActive && "bg-primary/10 text-primary hover:bg-primary/15"
              )}
              asChild
            >
              <Link href={item.href}>
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </Link>
            </Button>
          );
        })}

        {/* Task History Section */}
        <div className="mt-4">
          <TaskHistorySidebar isCollapsed={false} />
        </div>
      </div>

      {/* Bottom Items */}
      <div className="flex flex-col gap-2 w-full px-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-4 justify-start px-2",
            "h-10 rounded-lg",
            pathname === '/profile' && "bg-primary/10 text-primary hover:bg-primary/15"
          )}
          asChild
        >
          <Link href="/profile">
            <div className="flex items-center gap-4">
              <IconUser size={20} />
              <span>Profile</span>
            </div>
          </Link>
        </Button>
      </div>
    </aside>
  );
} 