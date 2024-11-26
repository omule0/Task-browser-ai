"use client";
import {
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  MenuIcon,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { HeaderTokenUsage } from "@/components/HeaderTokenUsage";
import { useAnnouncements } from "@/components/AnnouncementsProvider";
import { createClient } from "@/utils/supabase/client";
import { ModeToggle } from "@/components/mode-toggle";

export function HeaderUI({ user, logout }) {
  const { announcements, unreadCount, markAsRead } = useAnnouncements();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.is_admin || false);
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  const handleSignOut = async (formData) => {
    handleMenuItemClick();
    await logout(formData);
  };

  return (
    <header className="border-b bg-background">
      <div className="container flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">Digest.ai</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <nav className="hidden md:flex items-center gap-6 mr-4">
                <Link href="/#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Integrations
                </Link>
                <Link href="/#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Templates
                </Link>
                <HeaderTokenUsage />
              </nav>
              <Separator orientation="vertical" className="h-6 mx-4 hidden md:block" />
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" className="relative">
                      <Settings className="h-5 w-5" />
                      <span className="sr-only">Admin Panel</span>
                    </Button>
                  </Link>
                )}
                <HoverCard onOpenChange={(open) => {
                  if (open) markAsRead();
                }}>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <img src="/megaphone.png" className="h-5 w-5 dark:invert" alt="Megaphone" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-4">
                      <div className="font-medium text-foreground">Latest Announcements</div>
                      {announcements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-6 space-y-2">
                          <img src="/megaphone.png" className="h-12 w-12 dark:invert" alt="Megaphone" />
                          <p className="text-sm text-muted-foreground">
                            No announcements at the moment
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {announcements.slice(0, 3).map((announcement) => (
                            <div 
                              key={announcement.id} 
                              className={`text-sm border-b border-border last:border-0 pb-2 ${announcement.seen ? 'opacity-60' : ''}`}
                            >
                              <span className="font-medium text-foreground">{announcement.title}</span>
                              <p className="text-muted-foreground line-clamp-2">{announcement.content}</p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(announcement.created_at).toLocaleDateString()}
                                </span>
                                {announcement.link && (
                                  <a 
                                    href={announcement.link}
                                    className="text-xs text-primary hover:text-primary/80"
                                  >
                                    Learn more →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 border-t border-border">
                        <Link 
                          href="/announcements" 
                          className="text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1"
                        >
                          View all announcements
                          {announcements.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              ({announcements.length - 3} more)
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <Link href="/help">
                  <Button variant="ghost" size="icon">
                    <HelpCircleIcon className="h-8 w-8" />
                  </Button>
                </Link>
                <ModeToggle />
              </div>
              <div className="hidden md:block">
                <HoverCard onOpenChange={(open) => {
                  if (open) markAsRead();
                }}>
                  <HoverCardTrigger asChild>
                    <Avatar className="cursor-pointer h-8 w-8">
                      {user.user_metadata.avatar_url ? (
                        <AvatarImage src={user.user_metadata.avatar_url} alt="Profile" />
                      ) : (
                        <AvatarFallback>
                          {user.user_metadata.full_name?.[0] || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64">
                    <Link href="/profile" className="block mb-2">
                      <div className="font-medium text-foreground">
                        {user.user_metadata.full_name || "Profile"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {user.email}
                      </div>
                    </Link>
                    <Link
                      href="/workspacesettings"
                      className="flex items-center gap-2 text-sm text-foreground hover:bg-accent p-2 rounded-md"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Workspace Settings
                    </Link>
                    <form action={handleSignOut}>
                      <button className="w-full flex items-center gap-2 text-sm text-foreground hover:bg-accent p-2 rounded-md">
                        <LogOutIcon className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </HoverCardContent>
                </HoverCard>
              </div>

              <div className="md:hidden flex items-center gap-2">
                <ModeToggle />
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MenuIcon className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4">
                      <Link href="/#" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                        Integrations
                      </Link>
                      <Link href="/#" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                        Templates
                      </Link>
                    </nav>
                    <Separator className="my-4" />
                    <div className="flex flex-col gap-4">
                      <Link href="/announcements" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="justify-start w-full">
                          <img src="/megaphone.png" className="h-5 w-5 dark:invert" alt="Megaphone" />
                          Announcements
                        </Button>
                      </Link>
                      <Link href="/help" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="justify-start w-full">
                          <HelpCircleIcon className="mr-2 h-5 w-5" />
                          Help
                        </Button>
                      </Link>
                      <Link href="/workspacesettings" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="justify-start w-full">
                          <SettingsIcon className="mr-2 h-5 w-5" />
                          Workspace Settings
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="justify-start w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                    </div>
                    
                    <Separator className="my-4" />
                    <div className="flex items-center gap-4">
                      <Avatar>
                        {user.user_metadata.avatar_url ? (
                          <AvatarImage src={user.user_metadata.avatar_url} alt="Profile" />
                        ) : (
                          <AvatarFallback>
                            {user.user_metadata.full_name?.[0] || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-foreground">
                          {user.user_metadata.full_name || "Profile"}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <form action={handleSignOut} className="mt-4">
                      <Button variant="ghost" className="w-full justify-start">
                        <LogOutIcon className="mr-2 h-5 w-5" />
                        Sign out
                      </Button>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
} 