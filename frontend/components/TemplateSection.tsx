import { IconX, IconPlayerPlay, IconEdit, IconTrash, IconPlus, IconUser, IconDeviceFloppy, IconShare } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Category, Template, getTemplates, deleteTemplate } from "@/utils/template";
import { TemplateIcon } from "./TemplateIcon";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Portal from "@/components/ui/portal";

// Define a union type for all possible categories including 'Custom'
type ExtendedCategory = Category | 'Custom';

// Type guard to check if a category is a built-in category
const isBuiltInCategory = (category: ExtendedCategory): category is Category => {
  return category !== 'Custom';
};

const categories: { label: ExtendedCategory; icon: React.ReactNode }[] = [
  { label: 'Custom', icon: <IconUser className="w-5 h-5" /> },
  { label: 'Business', icon: <TemplateIcon category="Business" className="w-5 h-5" /> },
  { label: 'Marketing', icon: <TemplateIcon category="Marketing" className="w-5 h-5" /> },
  { label: 'Research', icon: <TemplateIcon category="Research" className="w-5 h-5" /> },
  { label: 'News', icon: <TemplateIcon category="News" className="w-5 h-5" /> },
  { label: 'Other', icon: <TemplateIcon category="Other" className="w-5 h-5" /> },
];

interface TemplateModalProps {
  template: Template;
  onClose: () => void;
  onSubmit: (task: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCustom?: boolean;
  onSaveAsCustom?: () => void;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
}

const ShareDialog = ({ isOpen, onClose, template }: ShareDialogProps) => {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate a shareable URL for the template
      const templateData = btoa(JSON.stringify(template));
      const url = `${window.location.origin}/template-studio?template=${encodeURIComponent(templateData)}`;
      setShareUrl(url);
    }
  }, [isOpen, template]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Template link has been copied to your clipboard.",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link. Please try again.",
      });
    }
  };

  // Only render if open to ensure proper portal behavior
  if (!isOpen) return null;

  return (
    <Portal wrapperId="share-dialog-root">
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle>Share Template</DialogTitle>
            <DialogDescription>
              Share this template with others by copying the link below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex items-center bg-accent rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            <Button size="sm" onClick={handleCopyLink}>
              Copy
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Portal>
  );
};

const TemplateModal = ({ template, onClose, onSubmit, onEdit, onDelete, isCustom, onSaveAsCustom }: TemplateModalProps) => {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Check if all variables are filled
    if (template.variables?.some(v => !variables[v])) {
      toast({
        variant: "destructive",
        title: "Missing Variables",
        description: "Please fill in all required variables.",
      });
      return;
    }

    // Replace variables in the prompt
    let finalPrompt = template.prompt || '';
    Object.entries(variables).forEach(([key, value]) => {
      finalPrompt = finalPrompt.replace(`{${key}}`, value);
    });

    // Submit the task
    onSubmit(finalPrompt);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-background rounded-2xl sm:rounded-3xl w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-lg animate-in fade-in zoom-in-95 duration-200">
          {/* Header - Fixed */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl text-primary font-medium">View Template</h2>
              <div className="flex items-center gap-2">
                {isCustom ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Edit template"
                    >
                      <IconEdit className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                      }}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete template"
                    >
                      <IconTrash className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsShareDialogOpen(true);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Share template"
                    >
                      <IconShare className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveAsCustom?.();
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Save as custom template"
                  >
                    <IconDeviceFloppy className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close modal"
                >
                  <IconX className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
            <div className="space-y-8">
              {/* Template Info Section */}
              <div className="space-y-6 pb-6 border-b border-border">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <TemplateIcon category={template.category} className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl sm:text-2xl font-semibold text-foreground">{template.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isCustom ? 'Created by you' : 'Default template'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Prompt Preview</h3>
                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                      {template.variables?.length || 0} variables
                    </span>
                  </div>
                  <div className="bg-muted rounded-lg sm:rounded-xl p-4">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {template.prompt || 'No prompt available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variables Section */}
              {template.variables && template.variables.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-medium text-foreground">Task Variables</h3>
                      <p className="text-sm text-muted-foreground">Fill in the details for your task</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm font-medium text-foreground">
                        {Object.keys(variables).filter(key => variables[key]).length}/{template.variables.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {template.variables.map((variable) => {
                      const isValid = variables[variable]?.trim().length > 0;
                      const isTouched = variable in variables;
                      
                      return (
                        <div key={variable} className="group">
                          <div className="flex items-center justify-between mb-2">
                            <label 
                              htmlFor={`var-${variable}`}
                              className="text-sm font-medium text-foreground"
                            >
                              {variable}
                            </label>
                            <div className="flex items-center space-x-2">
                              {isTouched && !isValid && (
                                <span className="text-xs font-medium text-destructive px-2 py-0.5 bg-destructive/10 rounded">
                                  Required
                                </span>
                              )}
                              {isValid && (
                                <span className="text-xs font-medium text-green-500 px-2 py-0.5 bg-green-500/10 rounded">
                                  Filled
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="relative">
                            <input
                              id={`var-${variable}`}
                              type="text"
                              value={variables[variable] || ''}
                              onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                              placeholder={`Enter ${variable.toLowerCase()}`}
                              className={`
                                w-full px-4 py-3 text-sm text-foreground
                                bg-background border rounded-lg
                                placeholder:text-muted-foreground/60
                                focus:outline-none focus:ring-2 focus:ring-ring
                                transition-all duration-200
                                ${isTouched && !isValid ? 'border-destructive/50 focus:border-destructive' : 'border-input'}
                                ${isValid ? 'border-green-500/50 focus:border-green-500' : ''}
                              `}
                              aria-describedby={`hint-${variable}`}
                            />
                            
                            {isValid && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <p 
                            id={`hint-${variable}`}
                            className="mt-2 text-xs text-muted-foreground"
                          >
                            This value will replace <code className="px-1.5 py-0.5 bg-muted rounded text-foreground/80">{`{${variable}}`}</code> in your prompt
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-4 sm:p-6 md:p-8 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-auto order-2 sm:order-1">
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
              <div className="w-full sm:w-auto order-1 sm:order-2">
                <Button
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmit();
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <IconPlayerPlay className="w-4 h-4" />
                  <span>Run Task</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isShareDialogOpen && (
        <ShareDialog 
          isOpen={isShareDialogOpen} 
          onClose={() => setIsShareDialogOpen(false)}
          template={template}
        />
      )}
    </Portal>
  );
};

const TemplateCard = ({ template, onSubmit, onEdit, onDelete }: { 
  template: Template; 
  onSubmit: (task: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isCustom = template.is_custom;
  const { toast } = useToast();
  const router = useRouter();

  const handleSaveAsCustom = () => {
    try {
      // Create a copy of the template with a new title
      const customTemplate = {
        ...template,
        id: undefined, // Remove the original ID
        title: `${template.title} (Custom)`,
        is_custom: true,
        subtitle: 'Created by you',
        created_at: undefined, // Remove the original creation date
        updated_at: undefined, // Remove the original update date
      };

      // Convert the template to a base64 string to avoid URL length limitations
      const templateData = btoa(JSON.stringify(customTemplate));
      
      // Navigate to template studio with the template data
      router.push(`/template-studio?template=${encodeURIComponent(templateData)}`);
    } catch (error) {
      console.error('Error preparing template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to prepare template for editing. Please try again.",
      });
    }
  };

  return (
    <div 
      className="group relative bg-card hover:bg-accent/50 rounded-xl border border-border hover:border-border/80 transition-all duration-200 overflow-hidden"
      onClick={() => setIsModalOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsModalOpen(true);
        }
      }}
    >
      <div className="w-full h-full p-4 sm:p-5 text-left">
        <div className="flex flex-col h-full space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TemplateIcon category={template.category} className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm sm:text-base text-foreground line-clamp-1">
                {template.title}
              </h3>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {template.prompt}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-xs text-muted-foreground/80">
              {template.variables?.length || 0} variables
            </span>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isCustom ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                    aria-label="Edit template"
                  >
                    <IconEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-accent"
                    aria-label="Delete template"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveAsCustom();
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  aria-label="Save as custom template"
                >
                  <IconDeviceFloppy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <TemplateModal
          template={template}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onSubmit}
          onEdit={onEdit}
          onDelete={onDelete}
          isCustom={isCustom}
          onSaveAsCustom={handleSaveAsCustom}
        />
      )}
    </div>
  );
};

interface TemplateSectionProps {
  onSubmit: (task: string) => void;
}

const TemplateSection = ({ onSubmit }: TemplateSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ExtendedCategory>('Custom');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
        const loadedTemplates = await getTemplates(user?.id);
        setTemplates(loadedTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          variant: "destructive",
          title: "Error Loading Templates",
          description: "Failed to load templates. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [supabase, toast]);

  const handleCategoryChange = (category: ExtendedCategory) => {
    if (category === 'Custom' && !userId) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to view custom templates.",
        action: (
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push('/login')}
            className="mt-2"
          >
            Log In
          </Button>
        ),
      });
      return;
    }
    setSelectedCategory(category);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const success = await deleteTemplate(templateId);
      if (success) {
        setTemplates(templates.filter(t => t.id !== templateId));
        toast({
          title: "Template Deleted",
          description: "Your template has been deleted successfully.",
        });
      } else {
        throw new Error("Failed to delete template");
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Error Deleting Template",
        description: "Failed to delete template. Please try again.",
      });
    }
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/template-studio?edit=${templateId}`);
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'Custom') {
      return template.is_custom && template.user_id === userId;
    }
    if (isBuiltInCategory(selectedCategory)) {
      return !template.is_custom && template.category === selectedCategory;
    }
    return false;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header Section */}
      <div className="space-y-4 pb-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Templates</h2>
            <p className="text-sm text-muted-foreground">
              Choose a template or create your own to get started quickly
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/template-studio')}
              variant="default"
              size="sm"
              className="inline-flex items-center gap-2 px-3"
            >
              <IconPlus className="w-4 h-4" />
              <span>Create Template</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Category Tabs */}
        <div className="relative">
          <div className="flex overflow-x-auto pb-2 -mb-2 scrollbar-none">
            <div className="flex gap-2">
              {categories.map(({ label, icon }) => (
                <Button
                  key={label}
                  variant={selectedCategory === label ? "default" : "ghost"}
                  size="sm"
                  className={`
                    px-4 py-2 h-9 whitespace-nowrap flex items-center gap-2
                    ${selectedCategory === label ? 'shadow-sm' : ''}
                  `}
                  onClick={() => handleCategoryChange(label)}
                >
                  <span className="opacity-80">{icon}</span>
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="relative h-[160px] bg-accent/20 rounded-xl animate-pulse"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-accent/30" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSubmit={onSubmit}
                  onEdit={
                    template.is_custom
                      ? () => handleEditTemplate(template.id)
                      : undefined
                  }
                  onDelete={
                    template.is_custom
                      ? () => handleDeleteTemplate(template.id)
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <IconPlus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3">No templates found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-[300px] text-center">
                  {selectedCategory === 'Custom'
                    ? "Create your first template to get started with custom workflows"
                    : "No templates available in this category yet"}
                </p>
                {selectedCategory === 'Custom' && (
                  <Button
                    onClick={() => router.push('/template-studio')}
                    variant="outline"
                    size="default"
                    className="flex items-center gap-2"
                  >
                    <IconPlus className="w-4 h-4" />
                    <span>Create Template</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSection; 