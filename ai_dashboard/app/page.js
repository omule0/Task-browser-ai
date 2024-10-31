"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ActionCards } from "@/components/ActionCards";
import { StatusCard } from "@/components/StatusCard";
import { InsightsCard } from "@/components/InsightsCard";
import { RecentActivity } from "@/components/RecentActivity";
import { VisualizationPreview } from "@/components/VisualizationPreview";
export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
    <title>Dashboard</title>
    <div className="flex flex-1">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-semibold mb-6">Home</h2>
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
