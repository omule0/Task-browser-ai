"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, FolderIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";


export function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Handle screen resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint
    };

    // Check initially
    checkIfMobile();

    // Add resize listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/",
      isActive: pathname === "/",
      icon: <HomeIcon className="h-5 w-5" />,
    },
    {
      label: "Files",
      href: "/files",
      isActive: pathname === "/files",
      icon: <FolderIcon className="h-5 w-5" />,
    },
    {
      label: "Canvas",
      href: "/canvas",
      isActive: pathname === "/canvas",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/#",
      isActive: pathname === "/#",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];

  const currentPage = navigationItems.find(item => item.isActive)?.label || "Dashboard";

  // Only render if on mobile
  if (!isMobile) return null;

  return (
    <div className="bg-white border-b md:hidden">
      <div className="flex items-center h-12 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </Button>
          <span className="font-medium">{currentPage}</span>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="fixed left-0 top-[48px] bottom-0 w-64 bg-white z-50 flex flex-col">
              {/* Workspace and Search Section */}
              <div className="p-4 border-b">
                <div className="mb-4">
                  <WorkspaceSwitcher onAction={() => setIsMenuOpen(false)} />
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search"
                    className="w-full p-2 rounded-lg border border-gray-300 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors flex items-center gap-3 ${
                        item.isActive 
                          ? "bg-purple-100 text-purple-600 border-l-4 border-purple-600" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </div>
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