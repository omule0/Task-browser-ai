"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Category, saveTemplate, updateTemplate, getTemplates } from "@/utils/template";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { TemplateIcon } from "@/components/TemplateIcon";
import { IconCopy, IconShare, IconDeviceFloppy, IconRobot } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";

const categories: { label: Category; icon: React.ReactNode }[] = [
  { label: 'Business', icon: <TemplateIcon category="Business" className="w-5 h-5" /> },
  { label: 'Marketing', icon: <TemplateIcon category="Marketing" className="w-5 h-5" /> },
  { label: 'Research', icon: <TemplateIcon category="Research" className="w-5 h-5" /> },
  { label: 'News', icon: <TemplateIcon category="News" className="w-5 h-5" /> },
  { label: 'Other', icon: <TemplateIcon category="Other" className="w-5 h-5" /> },
];

interface TemplateVariable {
  name: string;
  description?: string;
}

interface PreviewVariables {
  [key: string]: string;
}

// Separate the main content into a new component
function TemplateStudioContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [category, setCategory] = useState<Category>('Marketing');
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [newVariableName, setNewVariableName] = useState("");
  const [newVariableDescription, setNewVariableDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [previewVariables, setPreviewVariables] = useState<PreviewVariables>({});
  
  // New state for AI Chat feature
  const [isAIChatDialogOpen, setIsAIChatDialogOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  // Load template for editing
  useEffect(() => {
    const loadTemplate = async () => {
      const editId = searchParams.get('edit');
      const duplicateId = searchParams.get('duplicate');

      if (!editId && !duplicateId) return;

      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to edit templates.",
          });
          router.push("/");
          return;
        }

        const templates = await getTemplates(user.id);
        const template = templates.find(t => t.id === (editId || duplicateId));

        if (template) {
          setTemplateId(editId || null);
          setCategory(template.category);
          setTemplateName(duplicateId ? `${template.title} (Copy)` : template.title);
          setTemplateDescription(template.subtitle);
          setTemplateContent(template.prompt || "");
          setVariables((template.variables || []).map(v => ({ name: v })));
          setTags(template.tags || []);
        }
      } catch (error) {
        console.error("Error loading template:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Template",
          description: "Failed to load template. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [searchParams, supabase, toast, router]);

  useEffect(() => {
    // Check for template data in URL
    const templateParam = searchParams.get('template');
    if (templateParam) {
      try {
        // Decode the base64 string and parse the template data
        const decodedData = atob(decodeURIComponent(templateParam));
        const templateData = JSON.parse(decodedData);
        
        // Set the form data from the template
        setTemplateName(templateData.title);
        setCategory(templateData.category);
        setTemplateDescription(templateData.subtitle);
        setTemplateContent(templateData.prompt || '');
        // Convert string array of variables to TemplateVariable objects
        setVariables((templateData.variables || []).map((v: string) => ({ name: v })));
        setTags(templateData.tags || []);
      } catch (error) {
        console.error('Error parsing template data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load template data. Please try again.",
        });
      }
    }
  }, [searchParams, toast]);

  const handleAddVariable = () => {
    if (!newVariableName) {
      toast({
        variant: "destructive",
        title: "Missing Variable Name",
        description: "Please enter a variable name.",
      });
      return;
    }

    if (variables.some(v => v.name === newVariableName)) {
      toast({
        variant: "destructive",
        title: "Duplicate Variable",
        description: "A variable with this name already exists.",
      });
      return;
    }

    setVariables([...variables, { name: newVariableName, description: newVariableDescription }]);
    setNewVariableName("");
    setNewVariableDescription("");
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (!newTag) {
      toast({
        variant: "destructive",
        title: "Missing Tag",
        description: "Please enter a tag name.",
      });
      return;
    }

    if (tags.includes(newTag)) {
      toast({
        variant: "destructive",
        title: "Duplicate Tag",
        description: "This tag already exists.",
      });
      return;
    }

    setTags([...tags, newTag]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveTemplate = async () => {
    if (!templateName) {
      toast({
        variant: "destructive",
        title: "Missing Template Name",
        description: "Please enter a template name.",
      });
      return;
    }

    if (!templateContent) {
      toast({
        variant: "destructive",
        title: "Missing Template Content",
        description: "Please enter template content.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to save templates.",
        });
        return;
      }

      const templateData = {
        title: templateName,
        category,
        subtitle: templateDescription,
        prompt: templateContent,
        variables: variables.map(v => v.name),
        user_id: user.id,
        tags,
      };

      let savedTemplate;
      if (templateId) {
        savedTemplate = await updateTemplate(templateId, templateData);
      } else {
        savedTemplate = await saveTemplate(templateData);
      }

      if (!savedTemplate) {
        throw new Error("Failed to save template");
      }

      toast({
        title: "Template Saved",
        description: `Your template has been ${templateId ? 'updated' : 'saved'} successfully.`,
      });

      // Redirect to templates page
      router.push("/");
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Template",
        description: "There was an error saving your template. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateTemplate = () => {
    router.push(`/template-studio?duplicate=${templateId}`);
  };

  const handleShareTemplate = async () => {
    if (!templateId) return;

    const shareUrl = `${window.location.origin}/template/${templateId}`;
    setShareUrl(shareUrl);
    setIsShareDialogOpen(true);
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Template share link has been copied to clipboard.",
      });
    } catch (err) {
      console.error("Error copying share URL:", err);
      toast({
        variant: "destructive",
        title: "Error Copying Link",
        description: "Failed to copy link to clipboard.",
      });
    }
  };

  const getPreviewContent = () => {
    let previewText = templateContent;
    variables.forEach(variable => {
      const value = previewVariables[variable.name] || `[${variable.name}]`;
      previewText = previewText.replace(new RegExp(`{${variable.name}}`, 'g'), value);
    });
    return previewText;
  };

  // Function to handle generating template fields using AI
  const handleGenerateTemplateFields = async () => {
    if (!userPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Prompt",
        description: "Please enter a description of the template you want to create.",
      });
      return;
    }

    setIsGenerating(true);
    setAiResponse("");

    try {
      const response = await fetch("/api/generate-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate template fields");
      }

      const data = await response.json();
      
      // Update template fields with AI generated content
      if (data.title) setTemplateName(data.title);
      if (data.description) setTemplateDescription(data.description);
      if (data.content) setTemplateContent(data.content);
      if (data.category) setCategory(data.category as Category);
      if (data.tags && Array.isArray(data.tags)) setTags(data.tags);
      
      // Set variables from the simple array of strings
      if (data.variables && Array.isArray(data.variables)) {
        // Convert simple string array to TemplateVariable array
        setVariables(data.variables.map((varName: string) => ({
          name: varName,
          description: ''
        })));
      }

      setAiResponse("Template fields generated successfully! You can now review and edit them.");
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setIsAIChatDialogOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error generating template:", error);
      setAiResponse("Failed to generate template fields. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading template...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            {templateId ? 'Edit Template' : 'Create Template'}
          </h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAIChatDialogOpen(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              AI Generate
            </Button>
            {templateId && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDuplicateTemplate}
                  className="gap-2"
                >
                  <IconCopy className="w-4 h-4" />
                  Duplicate
                </Button>
                {templateId.startsWith('custom_') && (
                  <Button
                    variant="outline"
                    onClick={handleShareTemplate}
                    className="gap-2"
                  >
                    <IconShare className="w-4 h-4" />
                    Share
                  </Button>
                )}
              </>
            )}
            <Button onClick={handleSaveTemplate} disabled={isSaving} className="gap-2">
              <IconDeviceFloppy className="w-4 h-4" />
              {isSaving ? "Saving..." : templateId ? "Update Template" : "Save Template"}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                      category === cat.label
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-primary hover:text-primary/90 hover:bg-primary/10'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Template Info */}
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="Enter template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description</Label>
              <Textarea
                id="templateDescription"
                placeholder="Enter template description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Template Tags</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag}
                >
                  Add Tag
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter tag name"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Variables Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Template Variables</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariable}
                  disabled={!newVariableName}
                >
                  Add Variable
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Variable name (e.g., Company Name)"
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                />
                <Input
                  placeholder="Variable description (optional)"
                  value={newVariableDescription}
                  onChange={(e) => setNewVariableDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {variables.map((variable, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{variable.name}</div>
                      {variable.description && (
                        <div className="text-sm text-muted-foreground">{variable.description}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariable(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Content */}
            <Tabs defaultValue="editor" className="w-full">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="variables">Variables Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="templateContent">Template Content</Label>
                  <Textarea
                    id="templateContent"
                    placeholder="Enter your template content. Use {Variable Name} to reference variables."
                    className="min-h-[400px] font-mono"
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <div className="rounded-md border p-4 min-h-[400px]">
                  <pre className="whitespace-pre-wrap font-mono">
                    {getPreviewContent() || "Preview will appear here..."}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="variables" className="mt-4">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-4">Preview Variables</h3>
                    <div className="space-y-4">
                      {variables.map((variable) => (
                        <div key={variable.name} className="space-y-2">
                          <Label htmlFor={`preview-${variable.name}`}>
                            {variable.name}
                            {variable.description && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({variable.description})
                              </span>
                            )}
                          </Label>
                          <Input
                            id={`preview-${variable.name}`}
                            placeholder={`Enter value for ${variable.name}`}
                            value={previewVariables[variable.name] || ''}
                            onChange={(e) => setPreviewVariables(prev => ({
                              ...prev,
                              [variable.name]: e.target.value
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-4">Preview Output</h3>
                    <pre className="whitespace-pre-wrap font-mono bg-accent p-4 rounded-lg">
                      {getPreviewContent() || "Fill in the variables above to see the preview..."}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
            <DialogDescription>
              Share this template with others by copying the link below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="flex-1"
            />
            <Button onClick={handleCopyShareUrl}>
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog */}
      <Dialog open={isAIChatDialogOpen} onOpenChange={setIsAIChatDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconRobot className="w-5 h-5" />
              AI Template Generator
            </DialogTitle>
            <DialogDescription>
              Describe the template you want to create, and AI will generate the fields for you.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <Textarea
              placeholder="Describe your template (e.g., 'Create a template for analyzing competitor social media posts' or 'Create a template for generating product descriptions')"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-[150px]"
              disabled={isGenerating}
            />
            
            {!userPrompt && !isGenerating && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium">Example prompts:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <button 
                      onClick={() => setUserPrompt("Create a template for analyzing competitor social media accounts. It should check for post frequency, engagement rates, and content types.")}
                      className="text-primary hover:underline text-left"
                    >
                      &quot;Create a template for analyzing competitor social media accounts. It should check for post frequency, engagement rates, and content types.&quot;
                    </button>
                  </li>
                  <li className="flex items-start gap-2">
                    <button 
                      onClick={() => setUserPrompt("I need a template that helps researchers gather information about a specific topic from multiple news sources and synthesize the findings.")}
                      className="text-primary hover:underline text-left"
                    >
                      &quot;I need a template that helps researchers gather information about a specific topic from multiple news sources and synthesize the findings.&quot;
                    </button>
                  </li>
                  <li className="flex items-start gap-2">
                    <button 
                      onClick={() => setUserPrompt("Create a template for business users to analyze quarterly financial reports and extract key metrics and trends.")}
                      className="text-primary hover:underline text-left"
                    >
                      &quot;Create a template for business users to analyze quarterly financial reports and extract key metrics and trends.&quot;
                    </button>
                  </li>
                </ul>
              </div>
            )}
            
            {aiResponse && (
              <div className={`p-4 rounded-md ${aiResponse.includes('Failed') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {aiResponse}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAIChatDialogOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateTemplateFields}
              disabled={!userPrompt.trim() || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main page component with Suspense
export default function TemplateStudio() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </Card>
      </div>
    }>
      <TemplateStudioContent />
    </Suspense>
  );
} 