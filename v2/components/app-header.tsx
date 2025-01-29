"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { useState } from 'react'
import { cn } from "@/lib/utils"
import AgentSettings from './Agentsettings'
import { Model, StreamMode } from '@/types'

interface AppHeaderProps {
  className?: string
  isLoading?: boolean
  isOffline?: boolean
  onModelChange?: (model: Model) => void
  currentModel?: Model
  onStreamModeChange?: (mode: StreamMode) => void
  currentStreamMode?: StreamMode
}

export function AppHeader({ 
  className, 
  isLoading = false, 
  isOffline = false,
  onModelChange,
  currentModel = "gpt-4o-mini",
  onStreamModeChange,
  currentStreamMode = "updates"
}: AppHeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="fixed top-0 right-0 z-50 lg:left-[280px] left-0 px-4 lg:pl-8 pt-4 h-[50px] sm:h-[10px]">
      <Card role="banner" className={`flex flex-col sm:flex-row min-h-[60px] items-start sm:items-center gap-4 px-6 py-4 shadow-none bg-background/40 backdrop-blur-[2px] border-border/20 rounded-full ${className}`}>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Research Assistant</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-lg font-semibold">Research Assistant</h1>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto items-center">
          <Card className="flex items-center gap-2 px-4 py-3 bg-background/60 backdrop-blur-sm border-border/50 rounded-full">
            <div className={cn("h-2 w-2 rounded-full transition-colors", 
              isOffline ? "bg-red-500" :
              isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
            )} />
            <span className="text-sm">
              {isOffline ? "Offline" :
               isLoading ? "Processing" : "Operational"}
            </span>
          </Card>
          
          <div className="flex items-center gap-2">
            <Card className="flex items-center gap-1 p-1 bg-background/60 backdrop-blur-sm border-border/50 rounded-full">
              <MobileSidebar 
                isOpen={isSidebarOpen} 
                onOpenChange={setIsSidebarOpen} 
              />
              {onModelChange && onStreamModeChange && (
                <AgentSettings
                  onModelChange={onModelChange}
                  currentModel={currentModel}
                  onStreamModeChange={onStreamModeChange}
                  currentStreamMode={currentStreamMode}
                  className="transition-all duration-200"
                />
              )}
            </Card>

            <Card className="p-1 bg-background/60 backdrop-blur-sm border-border/50 rounded-full">
              <ThemeToggle />
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
} 