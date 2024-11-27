"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, FileText, FileIcon, LayoutDashboardIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

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
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <ChevronLeftIcon className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground ml-2">{currentPage}</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-64 p-0 bg-background">
                  <div className="h-12 border-b border-border px-4 flex items-center">
                    <span className="text-sm font-medium text-foreground">
                      {currentPage}
                    </span>
                  </div>

                  <div className="p-4 border-b border-border" onClick={(e) => e.stopPropagation()}>
                    <WorkspaceSwitcher isMobileNav={true} />
                  </div>

                  <nav className="flex-1 p-4 space-y-1">
                    {navigationItems.map((item, index) => (
                      <Link 
                        key={index} 
                        href={item.href}
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                          </div>
                        </NavigationMenuLink>
                      </Link>
                    ))}
                  </nav>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
} 