"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Loader2, Plus, Info } from "lucide-react";
import { customToast } from "@/components/ui/toast-theme";
import SelectFiles from "@/app/create-document/components/SelectFiles";
import { useWorkspace } from "@/context/workspace-context";
import { Loading } from "@/components/ui/loading";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function GenerateReport() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoadingSchemas, setIsLoadingSchemas] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Load saved schemas
  useEffect(() => {
    const loadSchemas = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('report_schemas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSchemas(data || []);

        if (!data || data.length === 0) {
          setIsRedirecting(true);
          customToast.info("Please create a Template first");
          setTimeout(() => {
            router.push('/schema-generator');
          }, 1500);
          return;
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        customToast.error('Failed to load templates');
      } finally {
        setIsLoadingSchemas(false);
      }
    };

    loadSchemas();
  }, [router]);

  // Load files effect
  useEffect(() => {
    const loadFiles = async () => {
      if (!currentWorkspace) return;
      
      try {
        setIsLoadingFiles(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get files from storage
        const { data: files, error: filesError } = await supabase.storage
          .from('documents')
          .list(`${currentWorkspace.id}/${user.id}`);

        if (filesError) throw filesError;

        // Get file contents
        const { data: contents, error: contentsError } = await supabase
          .from('document_content')
          .select('*')
          .in('file_path', files.map(f => `${currentWorkspace.id}/${user.id}/${f.name}`));

        if (contentsError) throw contentsError;

        // Combine file metadata with contents
        const processedFiles = files.map(file => ({
          ...file,
          file_path: `${currentWorkspace.id}/${user.id}/${file.name}`,
          originalName: file.name.split('-').slice(2).join('-'),
          content: contents.find(c => c.file_path === `${currentWorkspace.id}/${user.id}/${file.name}`)?.content
        }));

        setFiles(processedFiles);
      } catch (error) {
        console.error('Error loading files:', error);
        customToast.error('Failed to load files');
      } finally {
        setIsLoadingFiles(false);
      }
    };

    loadFiles();
  }, [currentWorkspace]);

  const handleFileSelect = (filePath) => {
    setSelectedFiles(prev => 
      prev.includes(filePath)
        ? prev.filter(f => f !== filePath)
        : [...prev, filePath]
    );
  };

  const handleGenerate = async () => {
    if (!selectedSchema || selectedFiles.length === 0) {
      customToast.error('Please select a Template and at least one file');
      return;
    }

    setIsGenerating(true);
    try {
      const supabase = createClient();
      
      // Get content from selected files
      const fileContents = await Promise.all(
        selectedFiles.map(async (filePath) => {
          const { data, error } = await supabase
            .from('document_content')
            .select('content')
            .eq('file_path', filePath)
            .single();

          if (error) throw error;
          return data.content;
        })
      );

      const response = await fetch('/api/generate_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schema: selectedSchema.schema,
          reportData: {
            files: fileContents,
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      if (data.success) {
        setGeneratedReport(data.report);
        customToast.success('Report generated successfully');
      } else {
        throw new Error(data.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      customToast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render loading/redirect state
  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading />
        <p className="mt-4 text-muted-foreground animate-pulse">
          Redirecting to Template Generator...
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You need to create a Template before generating a report
        </p>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Generate Report</h1>
          <p className="text-muted-foreground">
            Select a Template and files to generate a new report
          </p>
        </div>
        
        {/* Add Create Schema button */}
        <Button
          onClick={() => router.push('/schema-generator')}
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Template
        </Button>
      </div>

      {!generatedReport ? (
        <>

          {/* Schema Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Select Template</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-3">
                    <p className="text-sm">
                      Choose a template that defines the structure of your report. 
                      Each template determines how your report will be organized and what information it will contain.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {isLoadingSchemas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schemas.map((schema) => (
                  <Card
                    key={schema.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedSchema?.id === schema.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary'
                    }`}
                    onClick={() => setSelectedSchema(schema)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium">{schema.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(schema.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* File Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Select Files</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-3">
                    <p className="text-sm">
                      Select files that contain the information you want to include in your report. 
                      The AI will analyze these files to generate content following your chosen template structure.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <SelectFiles
              isLoadingFiles={isLoadingFiles}
              files={files}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
            />
          </section>

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={!selectedSchema || selectedFiles.length === 0 || isGenerating}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => setGeneratedReport(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>

          <Card className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h2 className="text-xl font-bold mb-4">Generated Report</h2>
              <pre className="p-4 bg-muted rounded-lg overflow-auto">
                {JSON.stringify(generatedReport, null, 2)}
              </pre>
            </div>
          </Card>
        </>
      )}
    </div>
  );
} 