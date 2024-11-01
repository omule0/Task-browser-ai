"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActionCards } from "@/components/ActionCards";
import { StatusCard } from "@/components/StatusCard";
import { InsightsCard } from "@/components/InsightsCard";
import { RecentActivity } from "@/components/RecentActivity";
import { VisualizationPreview } from "@/components/VisualizationPreview";
import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize Supabase client and get user data
  useState(() => {
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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <title>Dashboard</title>
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Welcome back, {user.user_metadata.full_name || user.email}
          </h2>
          <ActionCards />
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StatusCard />
            <VisualizationPreview/>
          </div> */}
          {/* <InsightsCard />
          <RecentActivity /> */}
        </main>
      </div>
    </>
  );
}
