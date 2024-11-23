"use client";
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, Upload, FileText, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingGuide({ onClose, onUploadClick, onExampleClick }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showUploadSidebar, setShowUploadSidebar] = useState(false);

  const handleUploadClick = () => {
    onUploadClick();
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
    },
    {
      title: "Get Business Insights",
      description: "Review AI-generated insights to make data-driven decisions for your business.",
      icon: <Lightbulb className="w-5 h-5" />,
      action: "View demo",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="relative p-6 border-2 border-purple-100 bg-purple-50/50">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-0.5 rounded">
              Quick Start Guide
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-white p-3 rounded-lg">
              {steps[currentStep].icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                {steps[currentStep].title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {steps[currentStep].description}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => {
                    if (steps[currentStep].onClick) {
                      steps[currentStep].onClick();
                    } else if (currentStep === 1) {
                      onExampleClick();
                    }
                  }}
                >
                  {steps[currentStep].action}
                </Button>
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
      </Card>
    </motion.div>
  );
} 