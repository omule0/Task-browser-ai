"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, FileText, FileIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="bg-background border-b md:hidden">
      <div className="flex items-center h-12 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-accent"
          >
            {isMenuOpen ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm font-medium">{currentPage}</span>
        </div>

        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed left-0 top-[96px] bottom-0 w-64 bg-background z-50 flex flex-col border-r">
              <div className="p-4 border-b">
                <div className="mb-4">
                  <WorkspaceSwitcher onAction={() => setIsMenuOpen(false)} />
                </div>
              </div>

              <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {navigationItems.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={item.isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 