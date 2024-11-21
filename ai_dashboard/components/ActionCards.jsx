"use client";
import React from "react";
import { useState } from "react";
import { SearchIcon, BarChartIcon, UploadIcon, FileIcon } from "lucide-react";
import { UploadSidebar } from "./UploadSidebar";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function ActionCard({ 
  icon, 
  title, 
  description, 
  variant = "default", 
  disabled, 
  onClick,
  tooltip,
  comingSoon,
  beta 
}) {
  const variants = {
    default: {
      icon: "text-indigo-500 bg-indigo-50",
      hover: "hover:bg-indigo-50",
      border: "hover:border-indigo-200",
    },
    upload: {
      icon: "text-pink-500 bg-pink-50",
      hover: "hover:bg-pink-50",
      border: "hover:border-pink-200",
    },
    visualize: {
      icon: "text-emerald-500 bg-emerald-50",
      hover: "hover:bg-emerald-50",
      border: "hover:border-emerald-200",
    },
    document: {
      icon: "text-orange-500 bg-orange-50",
      hover: "hover:bg-orange-50",
      border: "hover:border-orange-200",
    },
  };

  const style = variants[variant];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div variants={item} className="h-full">
            <Card
              className={cn(
                "relative h-[85px] transition-all duration-200 border-2",
                disabled ? "opacity-60 cursor-not-allowed" : cn(
                  style.hover,
                  style.border,
                  "cursor-pointer hover:shadow-md hover:scale-[1.02]"
                )
              )}
              onClick={disabled ? undefined : onClick}
            >
              <div className="p-3 h-full flex flex-col">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg flex items-center justify-center",
                    style.icon
                  )}>
                    {icon && React.cloneElement(icon, { className: "w-4 h-4" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-sm truncate">
                        {title}
                      </p>
                      {comingSoon && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] h-4 px-1 whitespace-nowrap"
                        >
                          Soon
                        </Badge>
                      )}
                      {beta && (
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-100 text-purple-700 text-[10px] h-4 px-1"
                        >
                          Beta
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-[300px] p-3"
          sideOffset={5}
        >
          <div className="space-y-2">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">
              {tooltip}
            </p>
            {disabled && comingSoon && (
              <p className="text-xs text-purple-600 mt-1.5">
                This feature is coming soon! Stay tuned for updates.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ActionCards({ onUploadSuccess }) {
  const [isUploadSidebarOpen, setIsUploadSidebarOpen] = useState(false);
  const router = useRouter();

  const actions = [
    {
      icon: <UploadIcon />,
      title: "Upload Data",
      description: "Add files for AI analysis",
      tooltip: "Upload PDF, DOCX, or TXT files for AI processing. These files will be used as reference material for generating documents and insights.",
      variant: "upload",
      onClick: () => setIsUploadSidebarOpen(true),
    },
    {
      icon: <FileIcon />,
      title: "Create Reports",
      description: "Generate AI reports",
      tooltip: "Create professional reports from your uploaded files using AI with various customization options. Choose from different report types and tailor the output to your needs.",
      variant: "document",
      onClick: () => router.push('/create-document'),
      beta: true,
    },
    {
      icon: <SearchIcon />,
      title: "Search Query",
      description: "Search through documents",
      tooltip: "Ask questions about your documents and get instant answers powered by AI. Search through your entire document collection using natural language.",
      variant: "default",
      disabled: true,
      comingSoon: true,
    },
    
    {
      icon: <BarChartIcon />,
      title: "Data Visualization",
      description: "Generate visual insights",
      tooltip: "Visualize patterns and trends in your documents with AI analytics. Generate charts, graphs, and other visual representations of your data.",
      variant: "visualize",
      disabled: true,
      comingSoon: true,
    },
    
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-8"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>

      <UploadSidebar 
        isOpen={isUploadSidebarOpen} 
        onClose={() => setIsUploadSidebarOpen(false)}
        onUploadSuccess={onUploadSuccess}
      />
    </motion.div>
  );
}
