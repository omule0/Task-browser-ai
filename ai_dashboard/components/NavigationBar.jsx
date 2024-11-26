"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, FileText, FileIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NavigationBar() {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/",
      isActive: pathname === "/",
      icon: <HomeIcon className="h-4 w-4" />,
    },
    {
      label: "Files",
      href: "/files",
      isActive: pathname === "/files",
      icon: <FileIcon className="h-4 w-4" />,
    },
    {
      label: "Documents",
      href: "/documents",
      isActive: pathname === "/documents",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "/#",
      isActive: pathname === "/#",
      icon: <SettingsIcon className="h-4 w-4" />,
    },
  ];

  const currentPage = navigationItems.find(item => item.isActive)?.label || "Dashboard";

  if (!isMobile) return null;

  return (
    <div className="bg-background border-border border-b md:hidden">
      <div className="flex items-center h-12 px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent"
              >
                <ChevronLeftIcon className="h-4 w-4 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-background">
              <SheetHeader className="h-12 border-b border-border px-4 flex items-center p-4">
                <SheetTitle className="text-sm font-medium text-foreground">
                  {currentPage}
                </SheetTitle>
              </SheetHeader>

              <div className="p-4 border-b border-border">
                <WorkspaceSwitcher />
              </div>

              <nav className="flex-1 p-4 space-y-1">
                {navigationItems.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                  >
                    <Button
                      variant={item.isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2 text-foreground"
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium text-foreground">{currentPage}</span>
        </div>
      </div>
    </div>
  );
} 