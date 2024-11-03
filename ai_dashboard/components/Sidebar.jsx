"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function SidebarItem({ icon, label, isActive = false, href, isCollapsed, onClick }) {
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
      onClick={onClick}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigationItems = [
    {
      icon: <HomeIcon className="h-4 w-4" />,
      label: "Home",
      href: "/",
      isActive: pathname === "/"
    },
    {
      icon: <FolderIcon className="h-4 w-4" />,
      label: "Files",
      href: "/files",
      isActive: pathname === "/files"
    },
    {
      icon: <SettingsIcon className="h-4 w-4 text-gray-500 hover:text-purple-600" />,
      label: "Settings",
      href: "/settings",
      isActive: pathname === "/settings"
    }
  ];

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 right-4 z-50"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      {isMobileMenuOpen ? (
        <XIcon className="h-6 w-6" />
      ) : (
        <MenuIcon className="h-6 w-6" />
      )}
    </Button>
  );

  return (
    <>
      <MobileMenuButton />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          inset-y-0 left-0
          z-40 md:z-0
          bg-white
          p-4
          flex flex-col
          transition-all duration-300
          border-r
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
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
            className="ml-2 hidden md:flex" // Hide on mobile
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!isCollapsed && (
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search"
              className="p-2 rounded-lg border border-gray-300 focus:ring-purple-500"
            />
          </div>
        )}

        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
              href={item.href}
              isCollapsed={isCollapsed}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="mt-auto">
          {/* Additional footer items can go here */}
        </div>
      </aside>
    </>
  );
}


