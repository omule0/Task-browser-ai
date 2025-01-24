import ChatInterface from "../components/ChatInterface";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export default function Home() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar className="border-r border-border m-4" />
      </div>

      <div className="flex-1">
        <AppHeader />
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="container max-w-5xl mx-auto">
            <ChatInterface />
          </div>
        </main>
      </div>
    </div>
  );
}
