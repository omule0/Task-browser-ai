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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white p-4 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              W
            </div>
            <span className="font-semibold">workspace</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
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
          icon={<HomeIcon />}
          label={isCollapsed ? "" : "Home"}
          isActive={pathname === "/"}
          href="/"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          icon={<FolderIcon />}
          label={isCollapsed ? "" : "Files"}
          isActive={pathname === "/files"}
          isCollapsed={isCollapsed}
          href="/files"
        />
      </nav>
      <div className="mt-auto">
        <SidebarItem
          icon={<SettingsIcon className="w-4 h-4 text-gray-500 hover:text-purple-600" />}
          label={isCollapsed ? "" : "Settings"}
          isActive={pathname === "/settings"}
          isCollapsed={isCollapsed}
          href="/settings"
        />
        {!isCollapsed && (
          <>
            {/* <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Within plan limits.</span>
              <ZapIcon className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-500">Upgrade for more.</p> */}
          </>
        )}
      </div>
    </aside>
  );
}


