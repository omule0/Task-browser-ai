"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Template, getTemplates } from "@/utils/template";
import { createClient } from "@/utils/supabase/client";
import { TemplateIcon } from "@/components/TemplateIcon";
import { IconCopy, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from "next/navigation";

export default function SharedTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [variables, setVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const templates = await getTemplates(user?.id);
        const foundTemplate = templates.find(t => t.id === params.id);

        if (!foundTemplate) {
          toast({
            variant: "destructive",
            title: "Template Not Found",
            description: "This template could not be found or is no longer available.",
          });
          router.push("/");
          return;
        }

        setTemplate(foundTemplate);
      } catch (error) {
        console.error("Error loading template:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Template",
          description: "Failed to load template. Please try again.",
        });
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
  }, [params.id, supabase, toast, router]);

  const handleCopyPrompt = async () => {
    if (!template) return;

    let finalPrompt = template.prompt || '';
    Object.entries(variables).forEach(([key, value]) => {
      finalPrompt = finalPrompt.replace(`{${key}}`, value);
    });

    try {
      await navigator.clipboard.writeText(finalPrompt);
      toast({
        title: "Prompt Copied",
        description: "Template prompt has been copied to clipboard.",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Copying Prompt",
        description: "Failed to copy prompt to clipboard.",
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading template...</div>;
  }

  if (!template) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="gap-2"
            >
              <IconArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{template.title}</h1>
          </div>
          <Button onClick={handleCopyPrompt} className="gap-2">
            <IconCopy className="w-4 h-4" />
            Copy Prompt
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/5 rounded-lg">
                <TemplateIcon category={template.category} />
              </div>
              <span className="text-sm text-muted-foreground">{template.subtitle}</span>
            </div>

            {template.variables && template.variables.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Template Variables</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {template.variables.map((variable) => (
                    <div key={variable} className="space-y-2">
                      <label className="text-sm font-medium">{variable}</label>
                      <input
                        type="text"
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                        placeholder={`Enter ${variable}`}
                        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Template Content</h3>
              <div className="p-4 bg-accent rounded-lg">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {template.prompt || "No content available"}
                </pre>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 