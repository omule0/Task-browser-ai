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
  Layout,
  GraduationCap,
  Search,
  BarChart3,
  Briefcase,
  DollarSign,
  Handshake,
  Sparkles,
  ChevronUp,
  Pencil,
  Wand2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useCompletion } from 'ai/react';

export default function CreateDocument() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const totalSteps = 3;
  const [showExamples, setShowExamples] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedSubType, setSelectedSubType] = useState(null);
  const MINIMUM_CHARACTERS = 30;

  const steps = ["Document Type", "Content Details", "Review"];

  const documentTypes = [
    { icon: <FileText className="h-6 w-6" />, title: "Report" },
    { icon: <Layout className="h-6 w-6" />, title: "Proposal" },
  ];

  const subTypes = {
    Report: [
      {
        icon: <GraduationCap className="h-5 w-5" />,
        title: "Student report",
        description:
          "A document detailing a student's academic progress or findings",
      },
      {
        icon: <Search className="h-5 w-5" />,
        title: "Research report",
        description:
          "A detailed document presenting clear findings and analysis",
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        title: "Annual report",
        description: "A trustworthy update on annual financial achievements",
      },
    ],
    Proposal: [
      {
        icon: <Briefcase className="h-5 w-5" />,
        title: "Project proposal",
        description:
          "A comprehensive plan outlining project scope and approach",
      },
      {
        icon: <DollarSign className="h-5 w-5" />,
        title: "Sales proposal",
        description:
          "A personalized document designed to persuade potential clients",
      },
      {
        icon: <Handshake className="h-5 w-5" />,
        title: "Partnership proposal",
        description:
          "A formal document outlining a business alliance or collaboration offer",
      },
    ],
  };

  const documentExamples = {
    Report: {
      "Student report": [
        {
          text: "A student report analyzing the impact of remote learning on student performance during the COVID-19 pandemic, including survey data and academic results.",
        },
        {
          text: "A comprehensive student report examining the effectiveness of different study techniques among first-year university students.",
        },
      ],
      "Research report": [
        {
          text: "A research report investigating the adoption of artificial intelligence in small businesses, including case studies and ROI analysis.",
        },
        {
          text: "A detailed research report on emerging renewable energy technologies and their potential impact on urban power grids.",
        },
      ],
      "Annual report": [
        {
          text: "An annual report highlighting the company's sustainable initiatives, financial performance, and strategic growth in the Asia-Pacific market.",
        },
        {
          text: "A comprehensive annual report showcasing the organization's achievements, financial metrics, and future expansion plans.",
        },
      ],
    },
    Proposal: {
      "Project proposal": [
        {
          text: "A project proposal for implementing a company-wide digital transformation initiative, including timeline and resource allocation.",
        },
        {
          text: "A detailed project proposal for developing a sustainable smart city infrastructure system.",
        },
      ],
      "Sales proposal": [
        {
          text: "A sales proposal for an enterprise-level cloud computing solution tailored for healthcare providers.",
        },
        {
          text: "A customized sales proposal for implementing an AI-powered customer service platform.",
        },
      ],
      "Partnership proposal": [
        {
          text: "A partnership proposal for collaboration between a tech startup and an established manufacturer to develop IoT solutions.",
        },
        {
          text: "A strategic partnership proposal for joint market expansion in emerging markets.",
        },
      ],
    },
  };

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
    api: '/api/write_for_me',
  });

  const handleWriteForMe = async () => {
    try {
      const completion = await complete('', {
        body: {
          documentType: selectedType,
          subType: selectedSubType,
        },
      });
      
      if (completion) {
        setInputValue(completion);
        setCharacterCount(completion.length);
      }
    } catch (error) {
      console.error('Error generating text:', error);
    }
  };

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
                      <Wand2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Writing...' : 'Write it for me'}
                    </Button>
                  </div>

                  {showExamples && (
                    <div className="grid gap-4">
                      {documentExamples[selectedType]?.[selectedSubType]?.map((example, index) => (
                        <Card 
                          key={index} 
                          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleExampleSelect(example.text)}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-gray-600">
                              {example.text}
                            </p>
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
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Previous
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setCurrentStep(3)}
                disabled={characterCount < MINIMUM_CHARACTERS}
              >
                Next step
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Previous
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Create Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
