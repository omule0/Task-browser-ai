"use client";
import { useState, useEffect } from "react";
import { ActionCards } from "@/components/ActionCards";
import { DashboardTabs } from "@/components/DashboardTabs";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { ExampleReports } from "@/components/ExampleReports";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter } from "next/navigation";
import { UploadSidebar } from "@/components/UploadSidebar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [refreshFiles, setRefreshFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useLocalStorage("show-onboarding", true);
  const [isUploadSidebarOpen, setIsUploadSidebarOpen] = useState(false);
  const router = useRouter();

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

  const handleUploadClick = () => {
    setIsUploadSidebarOpen(true);
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

        {showOnboarding && (
          <OnboardingGuide
            onClose={() => setShowOnboarding(false)}
            onUploadClick={() => setIsUploadSidebarOpen(true)}
          />
        )}

        <section className="mb-8">
          <ActionCards onUploadSuccess={handleUploadSuccess} />
        </section>

        <ExampleReports 
          onViewExample={(report) => {
            // Handle viewing example report
            router.push(`/examples/${report.title.toLowerCase().replace(/\s+/g, '-')}`);
          }} 
        />

        <UploadSidebar 
          isOpen={isUploadSidebarOpen}
          onClose={() => setIsUploadSidebarOpen(false)}
          onUploadSuccess={(files) => {
            handleUploadSuccess(files);
            setShowOnboarding(false); // Optionally close the onboarding after successful upload
          }}
        />

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <DashboardTabs refresh={refreshFiles} />
        </section>
      </main>
    </>
  );
}
