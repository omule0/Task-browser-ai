"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  LayoutDashboard,
  MessageSquare,
  Bot,
  Briefcase,
  PieChart,
  Users,
  Settings,
} from "lucide-react"
import { v4 as uuidv4 } from 'uuid'

const sidebarItems = [
  { icon: Plus, label: "New Chat", action: "new-chat" },
  { icon: LayoutDashboard, label: "Dashboard", action: "dashboard" },
  { icon: MessageSquare, label: "Chat", action: "chat" },
  { icon: Bot, label: "AI Assistant", action: "ai-assistant" },
  { icon: Briefcase, label: "Work", action: "work" },
  { icon: PieChart, label: "Insights", action: "insights" },
  { icon: Users, label: "Teams", action: "teams" },
  { icon: Settings, label: "Settings", action: "settings" },
]

interface SidebarProps {
  isCollapsed: boolean
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("Teams")
  const router = useRouter()

  const handleItemClick = (label: string, action: string) => {
    setActiveItem(label)
    
    if (action === "new-chat") {
      const chatId = uuidv4()
      router.push(`/chat/${chatId}`)
      return
    }
    
    // Handle other navigation actions
    router.push(`/${action}`)
  }

  return (
    <aside
      className={`h-screen bg-white shadow-lg flex flex-col items-center py-4 justify-between fixed left-0 top-0 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      <div className="space-y-6 w-full px-2">
        {sidebarItems.map((item) => (
          <div
            key={item.label}
            className={`p-2 rounded-lg transition-colors cursor-pointer group relative flex items-center ${
              activeItem === item.label ? "bg-neutral-100" : "hover:bg-neutral-100"
            }`}
            onClick={() => handleItemClick(item.label, item.action)}
          >
            <item.icon className={`w-6 h-6 ${item.action === "new-chat" ? "text-blue-600" : "text-neutral-600"}`} />
            {!isCollapsed && (
              <span className={`ml-3 text-sm font-medium ${item.action === "new-chat" ? "text-blue-600" : "text-neutral-600"}`}>
                {item.label}
              </span>
            )}
            {isCollapsed && (
              <span className="absolute left-full ml-2 bg-neutral-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

