'use client';

import { Dispatch, SetStateAction } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconRefresh,
  IconUser,
  IconLayoutSidebar,
  IconLayoutSidebarRightCollapse,
} from '@tabler/icons-react';

const sidebarItems = [
  { icon: <IconHome size={20} />, label: 'Home', href: '/' },
  { icon: <IconRefresh size={20} />, label: 'History', href: '/history' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: Dispatch<SetStateAction<boolean>>;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed md:sticky top-0 left-0 h-screen bg-background border-r flex flex-col items-center py-4 gap-2 transition-all duration-300 z-40",
        isCollapsed ? "w-[60px]" : "w-[200px]",
        "md:w-auto md:min-w-[60px]",
        !isCollapsed && "md:min-w-[200px]"
      )}
    >
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-xl hover:bg-muted"
        onClick={() => onToggle(!isCollapsed)}
      >
        {isCollapsed ? (
          <IconLayoutSidebarRightCollapse size={20} />
        ) : (
          <IconLayoutSidebar size={20} />
        )}
      </Button>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2 w-full px-2 mt-2">
        {sidebarItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-4 justify-start px-2",
                isCollapsed ? "w-10 h-10 rounded-xl" : "rounded-lg h-10",
                isActive && "bg-primary/10 text-primary hover:bg-primary/15"
              )}
              asChild
            >
              <Link href={item.href}>
                <div className={cn(
                  "flex items-center gap-4",
                  isCollapsed && "justify-center"
                )}>
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              </Link>
            </Button>
          );
        })}
      </div>

      {/* Bottom Items */}
      <div className="flex flex-col gap-2 w-full px-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-4 justify-start px-2",
            isCollapsed ? "w-10 h-10 rounded-xl" : "rounded-lg h-10",
            pathname === '/settings' && "bg-primary/10 text-primary hover:bg-primary/15"
          )}
          asChild
        >
          {/* <Link href="/settings">
            <div className={cn(
              "flex items-center gap-4",
              isCollapsed && "justify-center"
            )}>
              <IconSettings size={20} />
              {!isCollapsed && <span>Settings</span>}
            </div>
          </Link> */}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-4 justify-start px-2",
            isCollapsed ? "w-10 h-10 rounded-xl" : "rounded-lg h-10",
            pathname === '/profile' && "bg-primary/10 text-primary hover:bg-primary/15"
          )}
          asChild
        >
          <Link href="/profile">
            <div className={cn(
              "flex items-center gap-4",
              isCollapsed && "justify-center"
            )}>
              <IconUser size={20} />
              {!isCollapsed && <span>Profile</span>}
            </div>
          </Link>
        </Button>
      </div>
    </aside>
  );
} 