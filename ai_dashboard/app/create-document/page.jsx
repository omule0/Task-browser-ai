"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import {
  ChevronLeft,
  FileText,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import { useCompletion } from "ai/react";
import { subTypes } from "./constants/constants";
import { useWorkspace } from "@/context/workspace-context";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/ui/toast-theme";
import DocumentCards from "./components/DocumentCards";
import SelectFiles from "./components/SelectFiles";
import ContentDetails from "./components/ContentDetails";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  isTokenLimitExceeded, 
  isApproachingTokenLimit, 
  fetchTotalTokenUsage 
} from "@/utils/tokenLimits";

export default function CreateDocument() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const totalSteps = 4;
  const [characterCount, setCharacterCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedSubType, setSelectedSubType] = useState(null);
  const MINIMUM_CHARACTERS = 30;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const { currentWorkspace } = useWorkspace();
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tokenStats, setTokenStats] = useState({ totalTokensUsed: 0 });

  const steps = ["Document Type", "Select Files", "Content Details", "Review"];

  const handleCardClick = (title) => {
    setSelectedType(title);
    if (!subTypes[title]) {
      setCurrentStep(2);
    }
  };

  const handleSubTypeClick = (subType) => {
    setSelectedSubType(subType);
    setCurrentStep(2);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setCharacterCount(e.target.value.length);
  };

  const handleExampleSelect = (exampleText) => {
    setInputValue(exampleText);
    setCharacterCount(exampleText.length);
  };

  // Auth check similar to dashboard
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { complete, isLoading } = useCompletion({
    api: "/api/topic_generator",
  });

  const handleWriteForMe = async () => {
    try {
      const completion = await complete("", {
        body: {
          documentType: selectedType,
          subType: selectedSubType,
          selectedFiles: selectedFiles,
        },
      });

      if (completion) {
        setInputValue(completion);
        setCharacterCount(completion.length);
      }
    } catch (error) {
      console.error("Error generating text:", error);
    }
  };

  const loadFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: filesData, error } = await supabase
        .from("document_content")
        .select(
          `
          file_path,
          content,
          created_at
        `
        )
        .eq("user_id", user.id)
        .eq("workspace_id", currentWorkspace?.id);

      if (error) throw error;

      const processedFiles = filesData.map((file) => {
        const pathParts = file.file_path.split("/");
        const fileName = pathParts[pathParts.length - 1];
        const parts = fileName.split("-");
        const originalName = parts.slice(2).join("-");

        return {
          ...file,
          originalName,
          fileName,
        };
      });

      setFiles(processedFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadFiles();
      setSelectedFiles([]);
    } else {
      setFiles([]);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    async function fetchTokenUsage() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const usage = await fetchTotalTokenUsage(supabase, user.id);
      setTokenStats(usage);
    }

    fetchTokenUsage();
  }, []);

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      setGenerationError(null);
      setProgress(0);

      if (!currentWorkspace) {
        customToast.error("Please select a workspace first");
        return;
      }

      // Get content from selected files
      const supabase = createClient();
      const fileContents = await Promise.all(
        selectedFiles.map(async (filePath) => {
          const { data, error } = await supabase
            .from("document_content")
            .select("content")
            .eq("file_path", filePath)
            .single();

          if (error) throw error;
          return data.content;
        })
      );

      const response = await fetch("/api/generate_document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: selectedType,
          subType: selectedSubType || selectedType,
          content: inputValue,
          selectedFiles,
          fileContents,
          workspaceId: currentWorkspace.id,
        }),
      });

      const data = await response.json();

      // Handle token limit warnings
      if (data.warningType) {
        setGenerationError(data.details);
        customToast.warning(data.details);
        return;
      }

      if (!response.ok) {
        throw new Error(data.details || 'Failed to generate document');
      }

      setProgress(100);
      customToast.success(`${selectedSubType || selectedType} generated successfully!`);
      
      setTimeout(() => {
        router.push("/documents");
      }, 1000);
    } catch (error) {
      console.error(`Error generating ${selectedSubType || selectedType}:`, error);
      setGenerationError(error.message);
      setProgress(0);
      customToast.error(
        error.message.includes('Try adjusting your description or selected files') 
          ? 'Please provide more specific requirements for better results'
          : `Failed to generate ${selectedSubType || selectedType}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isGenerating && progress < 95) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 95));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isGenerating, progress]);

  const handleFileSelect = (filePath, isChecked) => {
    setSelectedFiles((prev) =>
      isChecked
        ? [...prev, filePath]
        : prev.filter((f) => f !== filePath)
    );
  };

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Simplified step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-purple-600">
            {steps[currentStep - 1]}
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <>
            <DocumentCards
              selectedType={selectedType}
              onCardClick={handleCardClick}
              onSubTypeClick={handleSubTypeClick}
            />

            <div className="flex justify-end items-center mt-8">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setCurrentStep(2)}
                disabled={
                  !selectedType || (subTypes[selectedType] && currentStep === 1)
                }
              >
                Next step
              </Button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <SelectFiles
                isLoadingFiles={isLoadingFiles}
                files={files}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
              />
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setCurrentStep(3)}
                disabled={selectedFiles.length === 0}
              >
                Next step
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <ContentDetails
              selectedType={selectedType}
              selectedSubType={selectedSubType}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onWriteForMe={handleWriteForMe}
              isLoading={isLoading}
              MINIMUM_CHARACTERS={MINIMUM_CHARACTERS}
            />

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setCurrentStep(4)}
                disabled={characterCount < MINIMUM_CHARACTERS}
              >
                Next step
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            {/* Token limit warnings */}
            {isTokenLimitExceeded(tokenStats) && (
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="font-medium">Token Limit Exceeded</p>
                    <p className="text-sm">
                      You have reached your token limit. Contact support to increase your limit.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!isTokenLimitExceeded(tokenStats) && isApproachingTokenLimit(tokenStats) && (
              <Card className="p-4 border-yellow-200 bg-yellow-50">
                <div className="flex gap-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                  <div className="space-y-1">
                    <p className="font-medium">Insufficient Tokens</p>
                    <p className="text-sm">
                      You don't have enough tokens remaining to generate this document. 
                      Contact support to increase your limit.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Summary Card */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                        Generating your{' '}
                        <span className="text-purple-600">{selectedSubType || selectedType}</span>
                      </span>
                    ) : (
                      'Review Details'
                    )}
                  </h1>
                  {!isGenerating && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={generateReport}
                      disabled={
                        isGenerating || 
                        isTokenLimitExceeded(tokenStats) || 
                        isApproachingTokenLimit(tokenStats)
                      }
                    >
                      {isTokenLimitExceeded(tokenStats)
                        ? "Token Limit Exceeded" 
                        : isApproachingTokenLimit(tokenStats)
                        ? "Insufficient Tokens"
                        : `Generate ${selectedSubType || selectedType}`}
                    </Button>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Document Type */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">Document Type</h3>
                    <Card className="p-4 bg-purple-50 border-purple-100">
                      <p className="font-medium text-purple-900">{selectedSubType || selectedType}</p>
                    </Card>
                  </div>

                  {/* Selected Files */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-500">
                        Selected Files ({selectedFiles.length})
                      </h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] p-3">
                            <p className="text-sm">
                              These files will be analyzed to generate your {selectedSubType || selectedType}. 
                              The AI will use their content as reference material to create a more accurate 
                              and relevant document.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Card className="p-4 max-h-[120px] overflow-y-auto">
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => {
                          const originalName = file.split("/").pop().split("-").slice(2).join("-");
                          return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{originalName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[300px] p-3">
                            <div className="space-y-2">
                              <p className="text-sm">
                                These requirements guide the AI in generating your {selectedSubType || selectedType}. 
                                The more specific and clear your requirements, the better the final output will match your needs.
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Card className="p-4 max-h-[120px] overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{inputValue}</p>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generation Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Estimated time: 2-3 minutes</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] p-3">
                          <div className="space-y-2">
                            <p className="text-sm">
                              Generation time may vary based on several factors:
                            </p>
                            <ul className="text-sm list-disc pl-4 space-y-1">
                              <li>Your internet connection speed</li>
                              <li>Number of files being analyzed</li>
                              <li>Size of each uploaded file</li>
                              <li>Length and complexity of the content</li>
                            </ul>
                            <p className="text-sm mt-2 text-muted-foreground">
                              Larger files and more complex requirements may take longer to process.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Generation Steps */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Analyzing Files', progress: progress > 30 },
                      { label: 'Generating Content', progress: progress > 60 },
                      { label: 'Finalizing Document', progress: progress > 90 }
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          step.progress ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-sm">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Error message */}
            {generationError && (
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p>{generationError}</p>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(3)}
                disabled={isGenerating}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}