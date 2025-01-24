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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <AppSidebar className="hidden lg:block" />
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
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
        <main className="flex-1">
          <div className="container max-w-5xl py-6">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  );
}
