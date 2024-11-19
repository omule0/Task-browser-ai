"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import {
  Sparkles,
} from "lucide-react";
import { useCompletion } from "ai/react";
import {
  subTypes,
} from "./constants/constants";
import { useWorkspace } from "@/context/workspace-context";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/ui/toast-theme";
import DocumentCards from "./components/DocumentCards";
import SelectFiles from "./components/SelectFiles";
import ContentDetails from "./components/ContentDetails";

// Update the shimmer class for better visibility
const shimmerClass = "animate-pulse bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-semibold";

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate document');
      }

      const report = await response.json();
      
      setProgress(100);
      customToast.success(`${selectedSubType || selectedType} generated successfully!`);
      
      setTimeout(() => {
        router.push("/documents");
      }, 1000);
    } catch (error) {
      console.error(`Error generating ${selectedSubType || selectedType}:`, error);
      setGenerationError(error.message);
      setProgress(0);
      setIsGenerating(false);
      
      customToast.error(
        error.message.includes('Try adjusting your description') 
          ? 'Please provide more specific requirements for better results'
          : `Failed to generate ${selectedSubType || selectedType}`
      );
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
            <h2 className="text-2xl font-semibold">Select Files</h2>
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-2xl font-bold">
                    {isGenerating ? (
                      <>
                        Generating your{' '}
                        <span className="text-purple-600">{selectedSubType || selectedType}</span>
                      </>
                    ) : (
                      'Review and Generate'
                    )}
                  </h1>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Document Type</h3>
                      <p className="mt-1">{selectedSubType || selectedType}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Selected Files</h3>
                      <div className="mt-1 space-y-1">
                        {selectedFiles.map((file, index) => {
                          const originalName = file.split("/").pop().split("-").slice(2).join("-");
                          return (
                            <div key={index} className="text-sm">{originalName}</div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
                      <p className="mt-1 text-sm">{inputValue}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                {isGenerating ? (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="space-y-4">
                        <Progress value={progress} className="h-2" />
                        <p className="text-center">
                          <span className={shimmerClass}>
                            Generating your {selectedSubType || selectedType}...
                          </span>
                        </p>
                      </div>
                    </Card>
                    <p className="text-sm text-gray-500 text-center">
                      This might take a few minutes
                    </p>
                  </div>
                ) : (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full h-12 text-lg"
                    onClick={generateReport}
                    disabled={isGenerating}
                  >
                    Generate {selectedSubType || selectedType}
                  </Button>
                )}
              </div>
            </div>

            {/* Error message */}
            {generationError && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                {generationError}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(3)}
                disabled={isGenerating}
              >
                Previous
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}