'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginLogoutButton from './LoginLogoutButton';
import { 
  IconLayoutSidebar,
  IconLayoutSidebarRightCollapse,
  IconLogout,
  IconPlus
} from '@tabler/icons-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from '@/utils/supabase/client';
import { Avatar, AvatarFallback } from './ui/avatar';

interface HeaderProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: (value: boolean) => void;
}

const Header = ({ className = '', isCollapsed, onToggle }: HeaderProps) => {
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      } ${className}`}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl hover:bg-muted"
              onClick={() => onToggle(!isCollapsed)}
            >
              {isCollapsed ? (
                <IconLayoutSidebarRightCollapse className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <IconLayoutSidebar className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>

            {/* Logo/Brand */}
            <Link 
              href="/" 
              className="flex items-center"
            >
              <span className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                DigestAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => window.location.href = '/'}
              aria-label="Start new task"
            >
              <IconPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
            {userEmail ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0"
                    aria-label="Profile menu"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                        {getInitials(userEmail)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 sm:w-64 p-2" align="end">
                  <div className="mb-2 sm:mb-3 px-2 py-1.5">
                    <div className="text-xs sm:text-sm font-medium text-gray-900 break-all">
                      {userEmail}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-2 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <IconLogout className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
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