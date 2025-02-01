"use client"

import type React from "react"
import { useState } from "react"
import { Search, User, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
}

export default function Header({ isCollapsed, setIsCollapsed }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchQuery)
  }

  return (
    <header className="sticky top-0 bg-slate-50 z-10 py-5">
      <div className="flex items-center justify-between gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-9 w-9"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 text-gray-600" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-gray-600" />
          )}
        </Button>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg px-4 py-2 w-full sm:w-[300px]">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="text-sm text-gray-400">⌘K</span>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

