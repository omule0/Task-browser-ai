"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Upload,
  Settings,
  Users,
  Search,
  Folder,
  HelpCircle,
  Mail,
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpTopics = [
    {
      category: "Getting Started",
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          title: "Creating Your First Document",
          content: "To create a new document:\n1. Click 'Generate New Document' button\n2. Select the type of document you want to create\n3. Upload or select relevant files\n4. Provide specific requirements\n5. Review and generate"
        },
        {
          title: "Setting Up Your Workspace",
          content: "Each user can create up to 3 workspaces:\n1. Go to Workspace Settings\n2. Click 'Create Workspace'\n3. Give your workspace a name\n4. Start organizing your documents and files"
        }
      ]
    },
    {
      category: "File Management",
      icon: <Upload className="h-5 w-5" />,
      items: [
        {
          title: "Uploading Files",
          content: "To upload files:\n1. Navigate to the Files page\n2. Drag and drop files or click to select\n3. Supported formats: PDF, DOC, DOCX, TXT\n4. Maximum file size: 10MB"
        },
        {
          title: "Managing Your Files",
          content: "In the Files section you can:\n• View file contents (PDF files)\n• Download files\n• Delete files\n• Monitor storage usage\n• Organize files by workspace"
        }
      ]
    },
    {
      category: "Workspace Management",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          title: "Managing Workspaces",
          content: "You can:\n• Create up to 3 workspaces\n• Switch between workspaces\n• Manage workspace settings\n• Delete workspaces when needed"
        },
        {
          title: "Collaboration Features",
          content: "Within a workspace:\n• Upload and share files\n• Generate documents\n• Organize content\n• Access shared resources"
        }
      ]
    },
    {
      category: "Support",
      icon: <HelpCircle className="h-5 w-5" />,
      items: [
        {
          title: "Contact Support",
          content: "Need help? Contact our support team:\n• Email: support@digest.ai\n• Response time: Within 24 hours\n• Available Monday-Friday"
        },
        {
          title: "Common Issues",
          content: "Common troubleshooting steps:\n1. Clear browser cache\n2. Check file size limits\n3. Verify supported file formats\n4. Ensure stable internet connection"
        }
      ]
    }
  ];

  const filteredTopics = helpTopics.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <>
      <title>Help Center</title>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and learn how to use Digest.ai
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Contact Support</h3>
                <p className="text-sm text-muted-foreground">Get help from our team</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Documentation</h3>
                <p className="text-sm text-muted-foreground">Read our guides</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium">Community</h3>
                <p className="text-sm text-muted-foreground">Join our community</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Help Topics */}
        <div className="space-y-6">
          {filteredTopics.map((category, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {category.icon}
                <h2 className="text-xl font-semibold">{category.category}</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem key={itemIndex} value={`item-${index}-${itemIndex}`}>
                    <AccordionTrigger className="text-left">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
} 