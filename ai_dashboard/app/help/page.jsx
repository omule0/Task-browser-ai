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
  LineChart,
  Printer,
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
    },
    {
      category: "Document Generation",
      icon: <FileText className="h-5 w-5" />,
      items: [
        {
          title: "Understanding Document Types",
          content: "Available document types include:\n• Research Reports\n• Buyside Due Diligence\n• Sellside Due Diligence\n• Business Plans\n• Equity Investment Analysis\n• Credit Investment Analysis\n\nEach type is optimized for specific analysis needs and follows industry-standard formats."
        },
        {
          title: "Document Generation Process",
          content: "How document generation works:\n1. Select document type\n2. Choose relevant files as sources\n3. Provide specific requirements\n4. AI analyzes source materials\n5. Generates structured document\n6. Review and download result"
        },
        {
          title: "Source File Requirements",
          content: "For optimal document generation:\n• Currently supports PDF files\n• Maximum file size: 10MB\n• Files should contain relevant content\n• Multiple files can be selected\n• Files must be in your workspace"
        }
      ]
    },
    {
      category: "Canvas & Visualization",
      icon: <LineChart className="h-5 w-5" />,
      items: [
        {
          title: "Using the Canvas View",
          content: "Canvas features include:\n• Interactive node-based visualization\n• Drag and drop file positioning\n• Connection creation between nodes\n• Mini-map navigation\n• Background grid system\n• Node deletion and management"
        },
        {
          title: "Document Organization",
          content: "Organize your documents effectively:\n• Create logical connections between related files\n• Use the mini-map for navigation\n• Group related documents together\n• Save canvas layouts\n• Export visualizations"
        }
      ]
    },
    {
      category: "Advanced Features",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          title: "Storage Management",
          content: "Monitor and manage storage:\n• View storage usage statistics\n• Track file sizes and counts\n• Delete unnecessary files\n• Optimize workspace storage\n• Understand storage limits"
        },
        {
          title: "Document Content Analysis",
          content: "Access advanced content features:\n• View parsed PDF content\n• Search within documents\n• Extract key information\n• Compare document contents\n• Track document versions"
        }
      ]
    },
    {
      category: "Printing & Export",
      icon: <Printer className="h-5 w-5" />,
      items: [
        {
          title: "Document Export Options",
          content: "Available export features:\n• Print documents directly\n• Save as PDF\n• Custom print layouts\n• Select specific sections\n• Include/exclude sources"
        },
        {
          title: "Print Optimization",
          content: "Tips for better printing:\n1. Use print preview\n2. Adjust page margins\n3. Select relevant sections\n4. Check formatting\n5. Verify all content is included"
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and learn how to use Digest.ai
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Mail className="h-5 w-5" />,
              title: "Contact Support",
              description: "Get help from our team"
            },
            {
              icon: <FileText className="h-5 w-5" />,
              title: "Documentation",
              description: "Read our guides"
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: "Community",
              description: "Join our community"
            }
          ].map((item, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <div className="text-primary">{item.icon}</div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Help Topics */}
        <div className="space-y-6">
          {filteredTopics.map((category, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-muted-foreground">{category.icon}</div>
                <h2 className="text-xl font-semibold text-foreground">
                  {category.category}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem key={itemIndex} value={`item-${index}-${itemIndex}`}>
                    <AccordionTrigger className="text-left text-foreground">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line text-muted-foreground">
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