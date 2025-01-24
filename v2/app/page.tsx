import ChatInterface from "../components/ChatInterface";
import { AppSidebar } from "@/components/app-sidebar";
import { Github, Twitter, Mail } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar className="border-r border-border m-4" />
      <div className="flex-1">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 bg-background px-6">
          <div className="flex items-center gap-2 lg:gap-4">
            <SidebarTrigger className="lg:hidden" />
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
          </div>
          <div className="ml-auto flex items-center gap-4">
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
        </header>
        <main className="px-8 py-6">
          <div className="container max-w-5xl">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  );
}
