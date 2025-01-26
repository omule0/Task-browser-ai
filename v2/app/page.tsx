"use client";

import { useState } from "react";
import ChatInterface from "../components/ChatInterface";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[280px]">
        <AppSidebar className="border-r border-border m-4" />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        <AppHeader isLoading={isLoading} isOffline={isOffline} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 mt-24">
          <div className="container max-w-5xl mx-auto">
            <ChatInterface 
              onLoadingChange={setIsLoading} 
              onOfflineChange={setIsOffline}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
