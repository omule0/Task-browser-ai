"use client";
import { useState } from "react";
import { SearchIcon, BarChartIcon, UploadIcon, FileIcon } from "lucide-react";
import { UploadSidebar } from "./UploadSidebar";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ActionCard({ icon, title, description, variant = "default", disabled, onClick }) {
  // Define variant styles
  const variants = {
    default: {
      icon: "text-indigo-500 bg-indigo-50",
      hover: "hover:bg-indigo-50",
    },
    upload: {
      icon: "text-pink-500 bg-pink-50",
      hover: "hover:bg-pink-50",
    },
    visualize: {
      icon: "text-emerald-500 bg-emerald-50",
      hover: "hover:bg-emerald-50",
    },
    document: {
      icon: "text-orange-500 bg-orange-50",
      hover: "hover:bg-orange-50",
    },
  };

  const style = variants[variant];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        disabled ? "opacity-50 cursor-not-allowed" : cn(
          style.hover,
          "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
        )
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="p-6 flex items-start space-x-4">
        <div className={cn(
          "p-3 rounded-lg flex items-center justify-center",
          style.icon
        )}>
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold tracking-tight">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

export function ActionCards({ onUploadSuccess }) {
  const [isUploadSidebarOpen, setIsUploadSidebarOpen] = useState(false);
  const router = useRouter();

  const actions = [
    {
      icon: <SearchIcon className="w-6 h-6" />,
      title: "New Search Query",
      description: "Start with a blank file",
      variant: "default",
      disabled: true,
    },
    {
      icon: <UploadIcon className="w-6 h-6" />,
      title: "Upload Data",
      description: "Upload your data",
      variant: "upload",
      onClick: () => setIsUploadSidebarOpen(true),
    },
    {
      icon: <BarChartIcon className="w-6 h-6" />,
      title: "Data Visualization",
      description: "View your data",
      variant: "visualize",
      disabled: true,
    },
    {
      icon: <FileIcon className="w-6 h-6" />,
      title: "Create Document",
      description: "Create a document",
      variant: "document",
      onClick: () => router.push('/create-document'),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>

      <UploadSidebar 
        isOpen={isUploadSidebarOpen} 
        onClose={() => setIsUploadSidebarOpen(false)}
        onUploadSuccess={onUploadSuccess}
      />
    </>
  );
}
