import { Github, Twitter, Mail, Menu } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppSidebar } from "@/components/app-sidebar"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
} from "@/components/ui/sheet"

interface AppHeaderProps {
  className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header className={`flex h-14 lg:h-[60px] items-center gap-4 bg-background px-6 ${className}`}>
      <div className="flex flex-col gap-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Research Assistant</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-lg font-semibold">Research Assistant</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <Card className="hidden sm:flex items-center gap-2 px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm">Operational</span>
        </Card>
        <Card className="flex items-center p-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 m-4 h-[calc(100vh-2rem)] rounded-xl border bg-background shadow-lg">
              <AppSidebar className="border-none shadow-none m-0 h-full" />
            </SheetContent>
          </Sheet>
          <div className="hidden sm:flex">
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        <Card className="p-1">
          <ThemeToggle />
        </Card>
      </div>
    </header>
  )
} 