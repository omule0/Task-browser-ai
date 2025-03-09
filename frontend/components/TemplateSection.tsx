import { IconX, IconPlayerPlay, IconEdit, IconTrash, IconPlus, IconUser, IconDeviceFloppy, IconShare } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Category, Template, getTemplates, deleteTemplate } from "@/utils/template";
import { TemplateIcon } from "./TemplateIcon";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Update Category type to include 'Custom'
export type ExtendedCategory = Category | 'Custom';

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
                    <button
                      onClick={onEdit}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      aria-label="Edit template"
                    >
                      <IconEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onDelete}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      aria-label="Delete template"
                    >
                      <IconTrash className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsShareDialogOpen(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      aria-label="Share template"
                    >
                      <IconShare className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onSaveAsCustom}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Save as custom template"
                  >
                    <IconDeviceFloppy className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Close modal"
                >
                  <IconX className="w-5 h-5" />
                </button>
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
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors order-1 sm:order-2"
            >
              <IconPlayerPlay className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Run Task</span>
            </button>
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
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group p-4 sm:p-5 bg-background rounded-xl sm:rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 sm:p-2.5 bg-primary/5 rounded-lg sm:rounded-xl group-hover:bg-primary/10 transition-colors duration-200">
              <TemplateIcon category={template.category} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary mb-2 sm:mb-2.5 truncate transition-colors duration-200">
              {template.title}
            </h3>
              {template.is_custom && (
                <span className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded-full">
                  Custom
                </span>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-1.5 sm:gap-y-2">
              <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[180px]">{template.subtitle}</span>
              <span className="px-2 sm:px-2.5 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded-full whitespace-nowrap group-hover:bg-primary/20 transition-colors duration-200">
                {template.category}
              </span>
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
          isCustom={template.is_custom}
          onSaveAsCustom={handleSaveAsCustom}
        />
      )}
    </>
  );
};

interface TemplateSectionProps {
  onSubmit: (task: string) => void;
}

const TemplateSection = ({ onSubmit }: TemplateSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<ExtendedCategory>('Custom');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
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
    setActiveCategory(category);
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
    if (activeCategory === 'Custom') {
      // Only show custom templates that belong to the current user
      return template.is_custom && template.user_id === userId;
    }
    // For non-custom templates, show all templates in the category
    return template.category === activeCategory;
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Create Template Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
          <p className="text-muted-foreground mt-1">
            Choose a template or create your own
          </p>
        </div>
        <Button
          onClick={() => router.push('/template-studio')}
          className="gap-2"
        >
          <IconPlus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Category Filters */}
      <div className="relative">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:overflow-x-visible sm:pb-0 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => handleCategoryChange(category.label)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                  activeCategory === category.label
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-primary hover:text-primary/90 hover:bg-primary/10'
                }`}
                aria-label={`Filter by ${category.label}`}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard 
            key={template.id} 
            template={template} 
            onSubmit={onSubmit}
            onEdit={template.is_custom && template.user_id === userId ? () => handleEditTemplate(template.id) : undefined}
            onDelete={template.is_custom && template.user_id === userId ? () => handleDeleteTemplate(template.id) : undefined}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {activeCategory === 'Custom' 
              ? userId 
                ? "You haven't created any custom templates yet."
                : "Please log in to view custom templates."
              : "No templates found in this category."}
          </p>
          {activeCategory === 'Custom' && !userId ? (
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="gap-2"
            >
              Log In
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/template-studio')}
              variant="outline"
              className="gap-2"
            >
              <IconPlus className="w-4 h-4" />
              Create New Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateSection; 