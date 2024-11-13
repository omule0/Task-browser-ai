"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import {
  ChevronDown,
  FileText,
  Sparkles,
  ChevronUp,
  Pencil,
  Wand2,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useCompletion } from "ai/react";
import {
  documentTypes,
  subTypes,
  documentExamples,
} from "./constants/constants";
import { useWorkspace } from "@/context/workspace-context";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/ui/toast-theme";

export default function CreateDocument() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const totalSteps = 4;
  const [showExamples, setShowExamples] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedSubType, setSelectedSubType] = useState(null);
  const MINIMUM_CHARACTERS = 30;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const { currentWorkspace } = useWorkspace();
  const [progress, setProgress] = useState({
    setup: 0,
    analysis: 0,
    generation: 0,
    optimization: 0
  });

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
        .eq("user_id", user.id);

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
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const generateReport = async () => {
    try {
      if (!currentWorkspace) {
        customToast.error("Please select a workspace first");
        return;
      }

      setIsGenerating(true);
      setGenerationError(null);

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

      const response = await fetch("/api/generate_report", {
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
        throw new Error(errorData.details || "Failed to generate report");
      }

      const report = await response.json();
      setGeneratedReport(report);
      customToast.success("Report generated successfully!");
      setTimeout(() => {
        router.push("/reports");
      }, 1000); // Short delay to allow toast to be visible
    } catch (error) {
      console.error("Error generating report:", error);
      setGenerationError(error.message);
      customToast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setProgress(prev => ({
          setup: Math.min(prev.setup + 2, 100),
          analysis: Math.min(prev.analysis + 1.5, 100),
          generation: Math.min(prev.generation + 1, 100),
          optimization: Math.min(prev.optimization + 0.8, 100)
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress bar and steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${
                index + 1 === currentStep
                  ? "text-purple-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2 
                ${
                  index + 1 === currentStep
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100"
                }`}
              >
                {index + 1 <= currentStep ? "✓" : index + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
        <Progress
          value={(currentStep / totalSteps) * 100}
          className="h-1 bg-gray-100"
        />
      </div>

      {/* Step content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <>
            <h2 className="text-2xl font-semibold">Select Document Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.map((doc) => (
                <Card
                  key={doc.title}
                  className={`cursor-pointer transition-colors ${
                    selectedType === doc.title ? "bg-purple-600 text-white" : ""
                  }`}
                  onClick={() => handleCardClick(doc.title)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedType === doc.title
                            ? "bg-purple-500"
                            : "bg-purple-100"
                        }`}
                      >
                        {doc.icon}
                      </div>
                      <h3 className="font-medium">{doc.title}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sub Types */}
            {selectedType && subTypes[selectedType] && (
              <div className="mt-8 space-y-4">
                <h3 className="text-xl font-medium">
                  Select type of {selectedType.toLowerCase()}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subTypes[selectedType].map((subType) => (
                    <Card
                      key={subType.title}
                      className="hover:border-purple-400 cursor-pointer transition-colors"
                      onClick={() => handleSubTypeClick(subType.title)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                              {subType.icon}
                            </div>
                            <h4 className="font-medium">{subType.title}</h4>
                          </div>
                          <p className="text-sm text-gray-500">
                            {subType.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
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
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.file_path}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.file_path)}
                      onChange={(e) => {
                        setSelectedFiles((prev) =>
                          e.target.checked
                            ? [...prev, file.file_path]
                            : prev.filter((f) => f !== file.file_path)
                        );
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{file.originalName}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No files available
                  </div>
                )}
              </div>
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-bold">
                Write what your {selectedSubType || selectedType} should be
                about
              </h1>
              <p className="text-gray-600 text-sm">
                With this information, we will craft an exceptional{" "}
                {selectedSubType || selectedType} for you.
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder={`Write what your ${
                        selectedSubType || selectedType
                      } should be about`}
                      className="min-h-[100px] p-4 resize-none"
                      value={inputValue}
                      onChange={handleInputChange}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {characterCount} / {MINIMUM_CHARACTERS} CHARACTERS
                      {characterCount < MINIMUM_CHARACTERS && " MINIMUM"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="text-purple-600"
                      onClick={() => setShowExamples(!showExamples)}
                    >
                      Show examples
                      {showExamples ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-purple-600"
                      onClick={handleWriteForMe}
                      disabled={isLoading}
                    >
                      <Wand2
                        className={`mr-2 h-4 w-4 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                      />
                      {isLoading ? "Writing..." : "Write it for me"}
                    </Button>
                  </div>

                  {showExamples && (
                    <div className="grid gap-4">
                      {documentExamples[selectedType]?.[selectedSubType]?.map(
                        (example, index) => (
                          <Card
                            key={index}
                            className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleExampleSelect(example.text)}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-gray-600">{example.text}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the card click
                                  handleExampleSelect(example.text);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

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
                        We're generating your{' '}
                        <span className="text-purple-600">{selectedSubType || selectedType}</span> now
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
                          const parts = file.split("/").pop().split("-");
                          const originalName = parts.slice(2).join("-");
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

              {isGenerating ? (
                <div className="space-y-4">
                  <Card className="p-4 flex justify-between items-center">
                    <span className="font-medium">Initial setup</span>
                    <Progress value={progress.setup} className="w-32 h-2" />
                  </Card>
                  <Card className="p-4 flex justify-between items-center">
                    <span className="font-medium">Content analysis</span>
                    <Progress value={progress.analysis} className="w-32 h-2" />
                  </Card>
                  <Card className="p-4 flex justify-between items-center">
                    <span className="font-medium">Report generation</span>
                    <Progress value={progress.generation} className="w-32 h-2" />
                  </Card>
                  <Card className="p-4 flex justify-between items-center">
                    <span className="font-medium">Final optimization</span>
                    <Progress value={progress.optimization} className="w-32 h-2" />
                  </Card>
                </div>
              ) : (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white w-1/2 h-12 text-lg mx-auto"
                  onClick={generateReport}
                  disabled={isGenerating}
                >
                  Generate Report
                </Button>
              )}
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
