"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActionCards } from "@/components/ActionCards";
import { FilePreview } from "@/components/FilePreview";
import { createClient } from "@/utils/supabase/client";
import { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [refreshFiles, setRefreshFiles] = useState(0);

  // Initialize Supabase client and get user data
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

  const handleUploadSuccess = () => {
    setRefreshFiles(prev => prev + 1);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <title>Dashboard</title>
      <Toaster />
      <div className="flex flex-1">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Welcome back, {user.user_metadata.full_name || user.email}
          </h2>
          <ActionCards onUploadSuccess={handleUploadSuccess} />
          <div className="mt-8">
            <FilePreview refresh={refreshFiles} />
          </div>
        </main>
      </div>
    </>
  );
}
