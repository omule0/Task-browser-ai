"use client";
import { useState } from "react";
import { SearchIcon, BarChartIcon, UploadIcon, FileIcon } from "lucide-react";
import { UploadSidebar } from "./UploadSidebar";
import { useRouter } from "next/navigation";

function ActionCard({ icon, title, description, bgColor, iconColor, hoverColor, disabled, onClick }) {
  return (
    <div 
      className={`${bgColor} rounded-xl p-4 flex items-start space-x-3 border border-gray-200 transition-all duration-200 
      ${disabled ? 'opacity-50 cursor-not-allowed' : `${hoverColor} hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
      border border-gray-100`}
      onClick={disabled ? undefined : onClick}
    >
        <div className={`p-2 ${iconColor} w-12 h-12 
          rounded-lg 
          flex items-center justify-center 
          bg-opacity-10`}>{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function ActionCards({ onUploadSuccess }) {
  const [isUploadSidebarOpen, setIsUploadSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ActionCard
          icon={<SearchIcon className="w-6 h-6" />}
          title="New Search Query"
          description="Start with a blank file"
          bgColor="bg-white"
          hoverColor="hover:bg-indigo-50"
          iconColor="text-indigo-500"
          disabled={true}
        />
        <ActionCard
          icon={<UploadIcon className="w-6 h-6" />}
          title="Upload Data"
          description="Upload your data"
          bgColor="bg-white"
          hoverColor="hover:bg-pink-50"
          iconColor="text-pink-500"
          onClick={() => setIsUploadSidebarOpen(true)}
        />
        <ActionCard
          icon={<BarChartIcon className="w-6 h-6" />}
          title="Data Visualization"
          description="View your data"
          bgColor="bg-white"
          hoverColor="hover:bg-emerald-50"
          iconColor="text-emerald-500"
          disabled={true}
        />
        <ActionCard
          icon={<FileIcon className="w-6 h-6" />}
          title="Create Document"
          description="Create a document"
          bgColor="bg-white"
          hoverColor="hover:bg-orange-50"
          iconColor="text-orange-500"
          onClick={() => router.push('/create-document')}
        />
      </div>

      <UploadSidebar 
        isOpen={isUploadSidebarOpen} 
        onClose={() => setIsUploadSidebarOpen(false)}
        onUploadSuccess={onUploadSuccess}
      />
    </>
  );
}
