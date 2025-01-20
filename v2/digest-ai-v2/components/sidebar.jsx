import Link from "next/link"
import { Home, Search, FileText, Code, FileIcon as FileInvoice, FileCode, Settings } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function Sidebar({ className }) {
  return (
    <Card className={cn("pb-12 w-64 m-4", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link href="/">
            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-13%20at%2015.00.19-NLlfIDf8OEqkL4gBEEX5sbTpNM3o8z.png" alt="Tavily Logo" className="h-8" />
          </Link>
        </div>
        <Separator />
        <div className="px-3">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2">
              Personal
            </Button>
          </div>
        </div>
        <Separator />
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link href="/overview">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Overview
              </Button>
            </Link>
            <Link href="/research">
              <Button variant="ghost" className="w-full justify-start gap-2 bg-accent">
                <Search className="h-4 w-4" />
                Research Assistant
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Research Reports
              </Button>
            </Link>
            <Link href="/playground">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Code className="h-4 w-4" />
                API Playground
              </Button>
            </Link>
            <Link href="/invoices">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FileInvoice className="h-4 w-4" />
                Invoices
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FileCode className="h-4 w-4" />
                Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Separator />
      <div className="mt-auto px-3">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm">Michael Omule</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

