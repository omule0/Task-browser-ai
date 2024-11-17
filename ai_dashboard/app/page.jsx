"use client";
import { useState, useEffect } from "react";
import { ActionCards } from "@/components/ActionCards";
import { DashboardTabs } from "@/components/DashboardTabs";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [refreshFiles, setRefreshFiles] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUploadSuccess = () => {
    setRefreshFiles(prev => prev + 1);
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Loading />;
  }

  return (
    <>
      <title>Dashboard</title>
      <main className="flex-1 p-0">
        {/* <h2 className="text-2xl font-semibold mb-6">
          Welcome back, {user.user_metadata.full_name || user.email}
        </h2> */}
        <ActionCards onUploadSuccess={handleUploadSuccess} />
        <div className="grid gap-4">
          <DashboardTabs refresh={refreshFiles} />
        </div>
      </main>
    </>
  );
}
