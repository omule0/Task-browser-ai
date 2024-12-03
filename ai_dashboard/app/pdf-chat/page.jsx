"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  Send,
  Minus,
  PlusIcon,
  RotateCw,
  SearchIcon,
  Plus,
  FolderPlus,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

export default function PDFChat() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar with reduced width */}
      <div 
        className={cn(
          "border-r border-gray-200 bg-[#1E1E1E] text-white flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
        )}
      >
        <div className="p-3 flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/')}
            className="mr-1 hover:bg-white/10 text-white h-8 w-8"
          >
            <ArrowLeft size={14} />
          </Button>
          <div className="w-6 h-6 bg-purple-600 rounded-lg"></div>
          <span className="font-semibold text-sm">ChatPDF</span>
        </div>

        <div className="p-3 space-y-1.5">
          <Button 
            className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border-0 h-8 text-sm" 
            variant="outline"
          >
            <Plus size={14} />
            New Chat
          </Button>
          <Button 
            className="w-full justify-start gap-2 bg-white/10 hover:bg-white/20 text-white border-0 h-8 text-sm" 
            variant="outline"
          >
            <FolderPlus size={14} />
            New Folder
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1.5">
            <Button
              variant="outline"
              className="w-full justify-start text-white/70 bg-white/10 hover:bg-white/20 border-0 h-8 text-sm"
            >
              Africa-in-China-web_CMG7.pdf
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col">
          {/* PDF Header */}
          <div className="flex items-center px-3 py-2 border-b border-gray-200 gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="mr-1 h-8 w-8"
            >
              {isSidebarCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
            </Button>
            <h2 className="text-base font-semibold flex-1">
              Africa-in-China-web_CMG7.pdf
            </h2>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Minus size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RotateCw size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PlusIcon size={14} />
              </Button>
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2 py-1">
                <span className="text-sm">5</span>
                <span className="text-sm text-gray-500">/ 49</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SearchIcon size={14} />
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-gray-100 p-8 flex justify-center">
            <div className="bg-gray-50 w-full max-w-2xl rounded-lg p-8 text-black">
              <h1 className="text-4xl font-bold text-center mb-4">
                AFRICA in CHINA'S
              </h1>
              <h1 className="text-4xl font-bold text-center mb-8">
                FOREIGN POLICY
              </h1>
              <p className="text-center text-xl mb-4">YUN SUN</p>
              <p className="text-center text-gray-500 mt-auto">April 2014</p>
              <p className="text-center text-xl mt-8">BROOKINGS</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          <div className="h-12 border-b border-gray-200 flex items-center px-4">
            <h2 className="font-semibold">Chat</h2>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div className="flex gap-2 bg-gray-100 rounded-lg p-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    The paper discusses several key themes regarding China's foreign
                    policy towards Africa:
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li>
                      1. Multifaceted Interests: China's interests extend beyond
                      mere access to natural resources...
                    </li>
                    <li>
                      2. Economic Engagement: The paper highlights China's
                      significant economic presence in Africa...
                    </li>
                    <li>
                      3. Bureaucratic Challenges: The internal bureaucratic
                      processes within China...
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <Input
                placeholder="Ask any question..."
                className="pr-20 bg-gray-100 border-gray-300"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-purple-600"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 