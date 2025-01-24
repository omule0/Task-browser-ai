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
    <div className="fixed top-0 right-0 z-50 lg:left-[280px] left-0 px-4 lg:pl-8 pt-4">
      <Card role="banner" className={`flex flex-col sm:flex-row min-h-[60px] items-start sm:items-center gap-4 px-6 py-4 shadow-sm bg-background/60 backdrop-blur-sm border-border/50 ${className}`}>
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
          <Card className="flex items-center gap-2 px-4 py-3 bg-background/60 backdrop-blur-sm border-border/50">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm">Operational</span>
          </Card>
          
          <div className="flex items-center gap-2">
            <Card className="flex items-center p-1 bg-background/60 backdrop-blur-sm border-border/50">
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
            </Card>

            <Card className="flex items-center gap-1 p-1 bg-background/60 backdrop-blur-sm border-border/50">
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

            <Card className="p-1 bg-background/60 backdrop-blur-sm border-border/50">
              <ThemeToggle />
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
} 