import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronUp,
  ChevronDown,
  Wand2,
  Pencil,
  AlertCircle
} from "lucide-react";
import { documentExamples } from "../constants/constants";

export default function ContentDetails({
  selectedType,
  selectedSubType,
  inputValue,
  onInputChange,
  onWriteForMe,
  isLoading,
  MINIMUM_CHARACTERS = 30
}) {
  const [showExamples, setShowExamples] = useState(false);
  const characterCount = inputValue.length;
  const isMinimumMet = characterCount >= MINIMUM_CHARACTERS;

  const handleExampleSelect = (exampleText) => {
    onInputChange({ target: { value: exampleText } });
    setShowExamples(false); // Auto-hide examples after selection
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <CardHeader className="px-0">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Write what your {selectedSubType || selectedType} should be about
          </h1>
          <p className="text-muted-foreground">
            With this information, we will craft an exceptional{" "}
            {selectedSubType || selectedType} for you.
          </p>
        </div>
      </CardHeader>

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder={`Describe your ${selectedSubType || selectedType} in detail...`}
                  className="min-h-[200px] p-4 resize-none text-base"
                  value={inputValue}
                  onChange={onInputChange}
                />
                <div 
                  className={`absolute bottom-3 right-3 text-sm flex items-center gap-2 
                    ${isMinimumMet ? 'text-green-600' : 'text-amber-600'}`}
                >
                  {!isMinimumMet && <AlertCircle className="h-4 w-4" />}
                  <span>
                    {characterCount} / {MINIMUM_CHARACTERS} characters
                    {!isMinimumMet && " required"}
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
                  disabled={isLoading || !isMinimumMet}
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