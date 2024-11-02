"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
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
          isCollapsed ? "opacity-0" : "opacity-100"
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white p-4 flex flex-col transition-all duration-300 border-r ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed && (
          <div className="flex-1">
            <WorkspaceSwitcher />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-2"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isCollapsed && (
        <Input
          type="text"
          placeholder="Search"
          className="mb-4 p-2 rounded-lg border border-gray-300 focus:ring-purple-500"
        />
      )}
      <nav className="space-y-2">
        <SidebarItem
          icon={<HomeIcon className="h-4 w-4" />}
          label="Home"
          isActive={pathname === "/"}
          href="/"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          icon={<FolderIcon className="h-4 w-4" />}
          label="Files"
          isActive={pathname === "/files"}
          isCollapsed={isCollapsed}
          href="/files"
        />
      </nav>
      <div className="mt-auto">
        <SidebarItem
          icon={<SettingsIcon className="h-4 w-4 text-gray-500 hover:text-purple-600" />}
          label="Settings"
          isActive={pathname === "/settings"}
          isCollapsed={isCollapsed}
          href="/settings"
        />
      </div>
    </aside>
  );
}


