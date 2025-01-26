"use client"

import * as React from "react"
import Link from "next/link"
import {
  Home,
  Settings,
  FileText,
  Stars,
  User,
  LogOutIcon,
  ChevronDown,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface UserProfile {
  name: string
  avatar?: string
  email?: string
}

const userProfile: UserProfile = {
  name: "User",
  email: "user@example.com"
}

interface MobileSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ isOpen, onOpenChange, className, ...props }: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-[280px] p-0 m-4 mb-8 h-[calc(110vh-6rem)] rounded-xl border bg-background shadow-lg">
        <SheetHeader className="p-4">
          <SheetTitle>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                D
              </div>
              <span className="font-semibold text-lg">Digest AI</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-4 py-4">
            <div className="px-3">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  Personal
                </Button>
              </div>
            </div>
            <Separator />
            <div className="px-3 py-2">
              <nav className="space-y-1">
                <Link href="/overview">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Home className="h-4 w-4" />
                    Overview
                  </Button>
                </Link>
                <Link href="/research">
                  <Button variant="ghost" className="w-full justify-start gap-2 bg-accent">
                    <Stars className="h-4 w-4" />
                    Research Assistant
                  </Button>
                </Link>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        My Account
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start gap-2 pl-8 text-sm">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
                <Link href="/reports">
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Research Reports
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        </ScrollArea>
        <Separator />
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              {userProfile.name[0]}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{userProfile.name}</span>
              {userProfile.email && (
                <span className="text-xs text-muted-foreground truncate">{userProfile.email}</span>
              )}
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 