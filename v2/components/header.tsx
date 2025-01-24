"use client"

import { Github, Twitter, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function Header() {
  return (
    <div className="flex-1 flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/research">Research</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Research Assistant</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-accent/50 px-3 py-1 rounded-full">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm">Operational</span>
        </div>
        <Card className="flex items-center p-1">
          <Button variant="ghost" size="icon">
            <Github className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Mail className="h-4 w-4" />
          </Button>
        </Card>
        <Card className="p-1">
          <ThemeToggle />
        </Card>
      </div>
    </div>
  )
} 