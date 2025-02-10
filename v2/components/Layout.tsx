"use client"

import type React from "react"
import { useState } from "react"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <Header isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        {children}
      </div>
    </div>
  )
}

