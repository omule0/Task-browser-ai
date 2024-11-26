import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronUp,
  ChevronDown,
  Wand2,
  Pencil,
  AlertCircle,
  Info
} from "lucide-react";
import { documentExamples } from "../constants/constants";
import { customToast } from "@/components/ui/toast-theme";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ContentDetails({
  selectedType,
  selectedSubType,
  inputValue,
  onInputChange,
  onWriteForMe,
  isLoading,
  MINIMUM_WORDS = 3,
  MAXIMUM_WORDS = 12
}) {
  const [showExamples, setShowExamples] = useState(false);
  const [lastWarningTime, setLastWarningTime] = useState(0);
  
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = getWordCount(inputValue);
  const isMinimumMet = wordCount >= MINIMUM_WORDS;
  const isMaximumExceeded = wordCount > MAXIMUM_WORDS;

  const handleInputChange = (e) => {
    const newText = e.target.value;
    const newWordCount = getWordCount(newText);
    
    // Allow deletion always
    if (newText.length < inputValue.length) {
      onInputChange(e);
      return;
    }

    // Check if exceeding word limit
    if (newWordCount > MAXIMUM_WORDS) {
      // Show warning toast max once every 2 seconds
      const now = Date.now();
      if (now - lastWarningTime > 2000) {
        customToast.warning(`Please keep your description under ${MAXIMUM_WORDS} words`);
        setLastWarningTime(now);
      }
      return;
    }

    onInputChange(e);
  };

  const handleExampleSelect = (exampleText) => {
    if (getWordCount(exampleText) <= MAXIMUM_WORDS) {
      onInputChange({ target: { value: exampleText } });
      setShowExamples(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <CardHeader className="px-0 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Write what your {selectedSubType || selectedType} should be about
            </h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] p-3">
                  <div className="space-y-2">
                    <p className="text-sm">
                      Describe your requirements for the {selectedSubType || selectedType}. For best results:
                    </p>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>Be specific about what you want to achieve</li>
                      <li>Include key points you want to be covered</li>
                      <li>Mention any particular style or tone preferences</li>
                      <li>Keep it between {MINIMUM_WORDS} and {MAXIMUM_WORDS} words</li>
                    </ul>
                    <p className="text-sm mt-2">
                      You can also use the "Write it for me" feature or select from example prompts below.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-3 w-3 text-gray-400" />
            <p className="text-sm text-muted-foreground">
              Keep it concise - between {MINIMUM_WORDS} and {MAXIMUM_WORDS} words
            </p>
          </div>
        </div>
      </CardHeader>

      <Card className={`border-2 ${isMaximumExceeded ? 'border-destructive' : ''}`}>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder={`Describe your ${selectedSubType || selectedType} in ${MINIMUM_WORDS}-${MAXIMUM_WORDS} words...`}
                className="min-h-[150px] p-3 resize-none text-sm"
                value={inputValue}
                onChange={handleInputChange}
              />
              <div 
                className={`absolute bottom-3 right-3 text-sm flex items-center gap-2 
                  ${isMaximumExceeded ? 'text-destructive' : 
                    isMinimumMet ? 'text-success' : 'text-warning'}`}
              >
                {!isMinimumMet && <AlertCircle className="h-4 w-4" />}
                {isMaximumExceeded && <AlertCircle className="h-4 w-4" />}
                <span>
                  {wordCount} / {MAXIMUM_WORDS} words
                  {!isMinimumMet && ` (minimum ${MINIMUM_WORDS})`}
                  {isMaximumExceeded && " (maximum exceeded)"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 text-sm"
                onClick={() => setShowExamples(!showExamples)}
              >
                {showExamples ? "Hide" : "Show"} examples
                {showExamples ? (
                  <ChevronUp className="ml-2 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-2 h-3 w-3" />
                )}
              </Button>
              <Button
                className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                onClick={onWriteForMe}
                disabled={isLoading}
              >
                <Wand2
                  className={`mr-2 h-3 w-3 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                {isLoading ? "Writing..." : "Write it for me"}
              </Button>
            </div>

            {showExamples && (
              <div className="space-y-2 mt-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-2">
                  Example prompts you can use:
                </h3>
                {documentExamples[selectedType]?.[selectedSubType]?.map(
                  (example, index) => (
                    <Card
                      key={index}
                      className="relative group cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {example.text}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleExampleSelect(example.text)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 