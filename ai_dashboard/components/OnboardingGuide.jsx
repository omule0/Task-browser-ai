"use client";
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Upload, FileText, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';

export function OnboardingGuide({ onClose, onUploadClick }) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleUploadClick = () => {
    if (onUploadClick) {
      onUploadClick();
      // After upload dialog is opened, listen for successful upload
      const checkUploadSuccess = (event) => {
        if (event.detail.success) {
          setCurrentStep(currentStep + 1);
          window.removeEventListener('uploadSuccess', checkUploadSuccess);
        }
      };
      window.addEventListener('uploadSuccess', checkUploadSuccess);
    }
  };

  const handleExampleClick = () => {
    router.push('/examples');
  };

  const steps = [
    {
      title: "Upload Your Documents",
      description: "Start by uploading your PDF documents. Our AI will analyze these to generate reports.",
      icon: <Upload className="w-5 h-5" />,
      action: "Try uploading",
      onClick: handleUploadClick
    },
    {
      title: "Generate Reports",
      description: "Our AI analyzes your documents and creates comprehensive reports with key insights and recommendations.",
      icon: <FileText className="w-5 h-5" />,
      action: "See example",
      onClick: handleExampleClick
    },
    {
      title: "Get Business Insights",
      description: "Review AI-generated insights to make data-driven decisions for your business.",
      icon: <Lightbulb className="w-5 h-5" />,
      action: "View demo",
      onClick: handleExampleClick
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="relative p-4 sm:p-6 border-2 border-primary/20 bg-primary/5">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-0.5 rounded">
              Quick Start Guide
            </span>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              {steps[currentStep].icon}
            </div>
            <div className="flex-1 w-full">
              <h3 className="font-semibold text-lg mb-1 text-foreground">
                {steps[currentStep].title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {steps[currentStep].description}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => {
                    if (steps[currentStep].onClick) {
                      steps[currentStep].onClick();
                    }
                  }}
                >
                  {steps[currentStep].action}
                </Button>
                <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  {currentStep > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 