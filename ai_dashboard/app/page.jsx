"use client";
import { useState, useEffect } from "react";
import { ActionCards } from "@/components/ActionCards";
import { DashboardTabs } from "@/components/DashboardTabs";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { UploadSidebar } from "@/components/UploadSidebar";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { FeedbackReminder } from "@/components/FeedbackReminder";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [refreshFiles, setRefreshFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useLocalStorage("show-onboarding", true);
  const [isUploadSidebarOpen, setIsUploadSidebarOpen] = useState(false);

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
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-xl md:text-xl font-bold text-foreground">
            Welcome back, {user.user_metadata.full_name || user.email}
          </h1>
          <div className="flex items-center gap-4">
            <FeedbackDialog />
          </div>
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

        {/* <ExampleReports 
          onViewExample={(report) => {
            // Handle viewing example report
            router.push(`/examples/${report.title.toLowerCase().replace(/\s+/g, '-')}`);
          }} 
        /> */}

        <UploadSidebar 
          isOpen={isUploadSidebarOpen}
          onClose={() => setIsUploadSidebarOpen(false)}
          onUploadSuccess={(files) => {
            handleUploadSuccess(files);
          }}
        />

        <section className="bg-card text-card-foreground rounded-lg shadow-sm">
          <DashboardTabs refresh={refreshFiles} />
        </section>
        <FeedbackReminder />
      </main>
    </>
  );
}
