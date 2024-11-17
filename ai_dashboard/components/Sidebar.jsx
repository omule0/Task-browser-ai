"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileText,
  FileIcon,
  LayoutDashboard,
  BarChart2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function SidebarItem({ icon, label, isActive = false, href, isCollapsed }) {
  const ButtonContent = () => (
    <>
      {icon}
      <span
        className={`ml-2 transition-opacity duration-300 ${
          isCollapsed ? "opacity-0 hidden md:inline-block" : "opacity-100"
        }`}
      >
        {label}
      </span>
    </>
  );

  const button = (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={`w-full justify-start hover:bg-gray-100 transition-all ${
        isActive ? "bg-purple-100 text-purple-600 border-l-4 border-purple-600" : ""
      }`}
      asChild={!!href}
    >
      {href ? (
        <Link href={href}>
          <ButtonContent />
        </Link>
      ) : (
        <ButtonContent />
      )}
    </Button>
  );

  // Only wrap with HoverCard if sidebar is collapsed
  return isCollapsed ? (
    <HoverCard>
      <HoverCardTrigger asChild>
        {button}
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-auto">
        {label}
      </HoverCardContent>
    </HoverCard>
  ) : button;
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
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

  const generalNavItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
      href: "/",
      isActive: pathname === "/",
    },
    {
      icon: <FileIcon className="h-4 w-4" />,
      label: "Files",
      href: "/files",
      isActive: pathname === "/files",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Documents",
      href: "/documents",
      isActive: pathname === "/documents",
    },
  ];

  const settingsNavItems = [
    {
      icon: <SettingsIcon className="h-4 w-4" />,
      label: "Settings",
      href: "/#",
      isActive: pathname === "/#",
    },
  ];

  if (isMobile) return null;

  return (
    <div className="relative flex h-full">
      <aside
        className={`
          flex-col
          bg-background
          p-4
          h-full
          border-r
          transition-all duration-300
          ${isCollapsed ? "w-20" : "w-48"}
        `}
      >
        <div className="flex items-center mb-6">
          <div className="flex-1">
            <WorkspaceSwitcher isCollapsed={isCollapsed} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {!isCollapsed && (
              <span className="px-2 text-xs font-medium text-muted-foreground">GENERAL</span>
            )}
            <nav className="flex flex-col gap-1">
              {generalNavItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  isActive={item.isActive}
                  href={item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-1">
            {!isCollapsed && (
              <span className="px-2 text-xs font-medium text-muted-foreground">SETTINGS</span>
            )}
            <nav className="flex flex-col gap-1">
              {settingsNavItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  isActive={item.isActive}
                  href={item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Collapse button positioned absolutely */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-6 hidden md:flex h-8 w-8 rounded-full border bg-white shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}


