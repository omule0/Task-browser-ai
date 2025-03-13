import { IconX, IconPlayerPlay, IconEdit, IconTrash, IconPlus, IconUser, IconDeviceFloppy, IconShare } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Category, Template, getTemplates, deleteTemplate } from "@/utils/template";
import { TemplateIcon } from "./TemplateIcon";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
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
    <>
      <div className="fixed inset-0 bg-foreground/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-2xl sm:rounded-3xl w-full max-w-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-lg">
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
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-xs sm:text-sm text-primary mb-1">Template Name</h3>
                <h4 className="text-xl sm:text-2xl text-foreground">{template.title}</h4>
              </div>

              <div>
                  <p className="text-sm sm:text-base text-indigo-400">
                    {isCustom ? 'Created by you' : 'Default template'}
                  </p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm text-primary mb-2">Prompt</h3>
                <p className="text-xs sm:text-sm text-primary/70 mb-2">Highlight and turn parts of your prompt into editable fields.</p>
                <div className="bg-accent rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-accent-foreground whitespace-pre-wrap">
                    {template.prompt || 'No prompt available'}
                  </p>
                </div>
              </div>

              {template.variables && template.variables.length > 0 && (
                <div>
                  <h3 className="text-xs sm:text-sm text-primary mb-2">Template Variables</h3>
                  <p className="text-xs sm:text-sm text-primary/70 mb-4">Fill in the values for each variable:</p>
                  <div className="space-y-3 sm:space-y-4">
                    {template.variables.map((variable) => (
                      <div key={variable} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div className="bg-accent rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <span className="text-sm sm:text-base text-accent-foreground">{variable}</span>
                        </div>
                        <input
                          type="text"
                          value={variables[variable] || ''}
                          onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                          placeholder="Enter value"
                          className="px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base text-foreground bg-background border border-input rounded-lg sm:rounded-xl focus:ring-2 focus:ring-ring focus:border-primary focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="p-4 sm:p-6 md:p-8 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <IconPlayerPlay className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Run Task</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        template={template}
      />
    </>
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Templates</h2>
          <Button
            onClick={() => router.push('/template-studio')}
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center space-x-2"
          >
            <IconPlus className="w-4 h-4" />
            <span>Create Template</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a template or create your own to get started quickly
        </p>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 -mb-2 scrollbar-none">
          <div className="flex space-x-2">
            {categories.map(({ label, icon }) => (
              <Button
                key={label}
                variant={selectedCategory === label ? "default" : "ghost"}
                size="sm"
                className="px-4 py-2 h-9 whitespace-nowrap"
                onClick={() => handleCategoryChange(label)}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[140px] bg-accent/20 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <IconPlus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedCategory === 'Custom'
                    ? "Create your first template to get started"
                    : "No templates available in this category"}
                </p>
                {selectedCategory === 'Custom' && (
                  <Button
                    onClick={() => router.push('/template-studio')}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
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