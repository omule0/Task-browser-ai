"use client"

import * as React from "react"
import Link from "next/link"
import {
  Home,
  Search,
  FileCode,
  Settings,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

const navigationData: NavItem[] = [
  {
    title: "Overview",
    url: "/overview",
    icon: Home,
    isActive: true,
  },
  {
    title: "Research",
    url: "/research",
    icon: Search,
    isActive: false,
    items: [
      {
        title: "Research Assistant",
        url: "/research/assistant",
      },
      {
        title: "Research Reports",
        url: "/research/reports",
      },
    ],
  },
  {
    title: "Documentation",
    url: "/docs",
    icon: FileCode,
    items: [
      {
        title: "API Reference",
        url: "/docs/api",
      },
      {
        title: "Guides",
        url: "/docs/guides",
      },
    ],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    items: [
      {
        title: "Profile",
        url: "/settings/profile",
      },
      {
        title: "Billing",
        url: "/settings/billing",
      },
    ],
  },
]

function NavigationGroup({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url} className="flex items-center gap-2">
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton asChild>
                  <a href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

interface UserProfile {
  name: string
  avatar?: string
  email?: string
}

const userProfile: UserProfile = {
  name: "User",
  email: "user@example.com"
}

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      collapsible="icon" 
      className={cn("group/sidebar", className)} 
      {...props}
    >
      <SidebarHeader className="border-b border-border p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            D
          </div>
          <span className="font-semibold text-lg">Digest AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavigationGroup items={navigationData} />
      </SidebarContent>
      <SidebarFooter className="border-t border-border">
        <div className="flex items-center gap-2 p-4">
          <div className="h-8 w-8 shrink-0 rounded-full bg-accent flex items-center justify-center">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className="h-full w-full rounded-full" />
            ) : (
              <span className="text-sm font-medium">{userProfile.name[0]}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{userProfile.name}</span>
            {userProfile.email && (
              <span className="text-xs text-muted-foreground truncate">{userProfile.email}</span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 