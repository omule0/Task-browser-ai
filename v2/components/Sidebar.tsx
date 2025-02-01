"use client"

import { useState } from "react"
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

const sidebarItems = [
  { icon: Plus, label: "Add" },
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Bot, label: "AI Assistant" },
  { icon: Briefcase, label: "Work" },
  { icon: PieChart, label: "Insights" },
  { icon: Users, label: "Teams" },
  { icon: Settings, label: "Settings" },
]

interface SidebarProps {
  isCollapsed: boolean
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("Teams")

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
            onClick={() => setActiveItem(item.label)}
          >
            <item.icon className="w-6 h-6 text-neutral-600" />
            {!isCollapsed && <span className="ml-3 text-sm font-medium text-neutral-600">{item.label}</span>}
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

