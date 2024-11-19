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

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <title>Dashboard</title>
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-xl md:text-xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user.user_metadata.full_name || user.email}
          </h1>
          {/* <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your AI interactions and files
          </p> */}
        </div>

        <section className="mb-8">
          <ActionCards onUploadSuccess={handleUploadSuccess} />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <DashboardTabs refresh={refreshFiles} />
        </section>
      </main>
    </>
  );
}
