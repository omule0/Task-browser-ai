'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginLogoutButton from './LoginLogoutButton';
import { 
  IconLayoutSidebar,
  IconLayoutSidebarRightCollapse,
  IconLogout,
  IconPlus,
} from '@tabler/icons-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createClient } from '@/utils/supabase/client';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ThemeToggle, ThemeToggleWithLabel } from './ThemeToggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: (value: boolean) => void;
}

const Header = ({ className = '', isCollapsed, onToggle }: HeaderProps) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUserEmail();
  }, [supabase.auth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900/90' 
          : 'bg-transparent',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-xl hover:bg-muted transition-colors"
                    onClick={() => onToggle(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    {isCollapsed ? (
                      <IconLayoutSidebarRightCollapse className="w-5 h-5" />
                    ) : (
                      <IconLayoutSidebar className="w-5 h-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Logo/Brand */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
              aria-label="DigestAI Home"
            >

              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                DigestAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Theme Toggle with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ThemeToggle className="mr-1" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* New Task Button with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="h-9 px-4 text-sm font-medium flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/50 transition-colors border-blue-200 dark:border-blue-900"
                    onClick={() => router.push('/')}
                    aria-label="Create new task"
                  >
                    <IconPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Task</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new task (⌘ + N)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {userEmail ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium dark:bg-blue-900 dark:text-blue-200">
                        {getInitials(userEmail)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="mb-3 px-2 py-1.5">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                      {userEmail}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {/* Theme Toggle with Label */}
                    <div className="w-full px-2 py-1.5 mb-2">
                      <ThemeToggleWithLabel className="w-full" />
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                      <IconLogout className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <LoginLogoutButton />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 