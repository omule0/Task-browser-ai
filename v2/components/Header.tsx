"use client"

import type React from "react"
import { User, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

interface HeaderProps {
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
}

export default function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white z-10 py-2">
      <div className="flex items-center justify-between gap-2 px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4 text-gray-600" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-gray-600" />
          )}
        </Button>
        {/* uncomment when sign in is implemented */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <User className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </header>
  )
}

