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
    <div className="max-w-3xl mx-auto space-y-6">
      <CardHeader className="px-0">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Write what your {selectedSubType || selectedType} should be about
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Keep it concise - between {MINIMUM_WORDS} and {MAXIMUM_WORDS} words
          </p>
        </div>
      </CardHeader>

      <Card className={`border-2 ${isMaximumExceeded ? 'border-red-200' : ''}`}>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder={`Describe your ${selectedSubType || selectedType} in ${MINIMUM_WORDS}-${MAXIMUM_WORDS} words...`}
                  className="min-h-[200px] p-4 resize-none text-base"
                  value={inputValue}
                  onChange={handleInputChange}
                />
                <div 
                  className={`absolute bottom-3 right-3 text-sm flex items-center gap-2 
                    ${isMaximumExceeded ? 'text-red-600' : 
                      isMinimumMet ? 'text-green-600' : 'text-amber-600'}`}
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

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setShowExamples(!showExamples)}
                >
                  {showExamples ? "Hide" : "Show"} examples
                  {showExamples ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
                <Button
                  className="flex-1 h-10 bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={onWriteForMe}
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
                <div className="space-y-3 mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Example prompts you can use:
                  </h3>
                  {documentExamples[selectedType]?.[selectedSubType]?.map(
                    (example, index) => (
                      <Card
                        key={index}
                        className="relative group cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {example.text}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleExampleSelect(example.text)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 