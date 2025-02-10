"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Plus,
  MessageSquare,
  FileText,
  type LucideIcon
} from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { cn } from "@/lib/utils"

interface SidebarItem {
  icon: LucideIcon
  label: string
  action: string
}

const sidebarItems: SidebarItem[] = [
  { 
    icon: Plus, 
    label: "New thread", 
    action: ""
  },
  {
    icon: FileText,
    label: "Report Agent",
    action: "report_agent"
  }
]

interface SidebarProps {
  isCollapsed: boolean
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleItemClick = async (label: string, action: string) => {
    try {
      setIsLoading(true)
      
      if (action === "new-chat") {
        const chatId = uuidv4()
        router.push(`/chat/${chatId}`)
        return
      }
      
      router.push(`/${action}`)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, label: string, action: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleItemClick(label, action)
    }
  }

  return (
    <aside
      className={cn(
        "h-screen bg-slate-50 shadow-lg flex flex-col py-4 fixed left-0 top-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="space-y-2 w-full px-2">
        {sidebarItems.map((item) => {
          const isActive = item.action === "" 
            ? pathname === "/" 
            : pathname.startsWith(`/${item.action}`)

          return (
            <div
              key={item.label}
              role="button"
              tabIndex={0}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "p-2 rounded-lg transition-all cursor-pointer group relative flex items-center",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                "hover:bg-neutral-100",
                isActive && "bg-neutral-100"
              )}
              onClick={() => !isLoading && handleItemClick(item.label, item.action)}
              onKeyDown={(e) => handleKeyDown(e, item.label, item.action)}
            >
              <div className="flex items-center">
                <item.icon 
                  className={cn(
                    "w-6 h-6",
                    isLoading ? "text-neutral-400" : item.action === "new-chat" ? "text-blue-600" : "text-neutral-600"
                  )} 
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span 
                    className={cn(
                      "ml-3 text-sm font-medium",
                      isLoading ? "text-neutral-400" : item.action === "new-chat" ? "text-blue-600" : "text-neutral-600"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </div>
              
              {isCollapsed && (
                <span 
                  className="absolute left-full ml-2 bg-neutral-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                  role="tooltip"
                >
                  {item.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {isLoading && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="animate-pulse text-neutral-400 text-xs">
            Loading...
          </div>
        </div>
      )}
    </aside>
  )
}

