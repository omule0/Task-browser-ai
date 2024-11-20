"use client";
import {
  GiftIcon,
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  MenuIcon,
  MegaphoneIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

export function HeaderUI({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);

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
                <Link href="/integrations" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Integrations
                </Link>
                <Link href="/templates" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Templates
                </Link>
                <HeaderTokenUsage />
              </nav>
              <Separator orientation="vertical" className="h-6 mx-4 hidden md:block" />
              <div className="hidden md:flex items-center">
                <Button variant="ghost" size="icon">
                  <img src="/megaphone.png" className="mr-2 h-5 w-5" alt="Megaphone" />
                </Button>
                <Link href="/help">
                  <Button variant="ghost" size="icon">
                    <HelpCircleIcon className="h-8 w-8" />
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <HoverCard>
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
                    <Link
                      href="/profile"
                      className="block mb-2"
                    >
                      <div className="font-medium">
                        {user.user_metadata.full_name || "Profile"}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {user.email}
                      </div>
                    </Link>
                    <Link
                      href="/workspacesettings"
                      className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 p-2 rounded-md"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Workspace Settings
                    </Link>
                    <form action={handleSignOut}>
                      <button className="w-full flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 p-2 rounded-md">
                        <LogOutIcon className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </HoverCardContent>
                </HoverCard>
              </div>

              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4">
                    <Link href="/integrations" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                      Integrations
                    </Link>
                    <Link href="/templates" className="text-sm font-medium" onClick={() => setIsOpen(false)}>
                      Templates
                    </Link>
                  </nav>
                  <Separator className="my-4" />
                  <div className="flex flex-col gap-4">
                    <Button variant="ghost" className="justify-start">
                      <img src="/megaphone.png" className="mr-2 h-5 w-5" alt="Megaphone" />
                      Announcements
                    </Button>
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
                      <div className="text-sm font-medium">
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
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 