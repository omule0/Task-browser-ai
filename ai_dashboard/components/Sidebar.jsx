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

  return (
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

  // Only render if on desktop
  if (isMobile) return null;

  const navigationItems = [
    {
      icon: <HomeIcon className="w-5 h-5" />,
      label: "Dashboard",
      href: "/",
      isActive: pathname === "/",
    },
    {
      icon: <FileIcon className="w-5 h-5" />,
      label: "Files",
      href: "/files",
      isActive: pathname === "/files",
    },
    // {
    //   icon: <LayoutDashboard className="w-5 h-5" />,
    //   label: "Canvas",
    //   href: "/canvas",
    //   isActive: pathname === "/canvas",
    // },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Documents",
      href: "/documents",
      isActive: pathname === "/documents",
    },
    {
      icon: <SettingsIcon className="w-5 h-5" />,
      label: "Settings",
      href: "/#",
      isActive: pathname === "/#",
    },
  ];

  return (
    <aside
      className={`
        flex-col
        bg-white
        p-4
        transition-all duration-300
        border-r
        ${isCollapsed ? "w-20" : "w-64"}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex-1 ${isCollapsed ? 'w-full' : ''}`}>
          <WorkspaceSwitcher isCollapsed={isCollapsed} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-2 hidden md:flex" // Hide on mobile
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* {!isCollapsed && (
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search"
            className="p-2 rounded-lg border border-gray-300 focus:ring-purple-500"
          />
        </div>
      )} */}

      <nav className="space-y-2">
        {navigationItems.map((item, index) => (
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

      <div className="mt-auto">
        {/* Additional footer items can go here */}
      </div>
    </aside>
  );
}


