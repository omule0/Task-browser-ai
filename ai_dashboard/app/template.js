"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { AnnouncementsProvider } from "@/components/AnnouncementsProvider";
import { WorkspaceProvider } from "@/context/workspace-context";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Header";
import { NavigationBar } from "@/components/NavigationBar";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function Template({ children }) {
  const pathname = usePathname();
  const isPDFChatRoute = pathname.startsWith('/pdf-chat');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isPDFChatRoute) {
    return children;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AnnouncementsProvider>
        <Toaster/>
        <WorkspaceProvider>
          <div className="flex flex-col h-screen">
            <div className="shrink-0">
              <Header user={user} />
              {user && <NavigationBar />}
            </div>
            <div className="flex flex-1 h-[calc(100vh-48px)] overflow-hidden">
              {user && <Sidebar />}
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </WorkspaceProvider>
      </AnnouncementsProvider>
    </ThemeProvider>
  );
} 