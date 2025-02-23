'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginLogoutButton from './LoginLogoutButton';
import { 
  IconLayoutSidebar,
  IconLayoutSidebarRightCollapse,
  IconLogout,
  IconRefresh
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
  onReset?: () => void;
}

const Header = ({ className = '', isCollapsed, onToggle, onReset }: HeaderProps) => {
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
  }, []);

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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle */}
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

            {/* Logo/Brand */}
            <Link 
              href="/" 
              className="flex items-center"
            >
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                DigestAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-4">
            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={onReset}
              >
                <IconRefresh size={16} />
                <span className="ml-2 text-sm">Refresh chat</span>
              </Button>
            )}
            {userEmail ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label="Profile menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(userEmail)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="mb-3 px-2 py-1.5">
                    <div className="text-sm font-medium text-gray-900">{userEmail}</div>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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