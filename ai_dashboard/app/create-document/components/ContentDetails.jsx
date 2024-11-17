import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Wand2, 
  Pencil 
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

  const handleExampleSelect = (exampleText) => {
    onInputChange({ target: { value: exampleText } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-lg font-bold">
          Write what your {selectedSubType || selectedType} should be about
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
                onChange={onInputChange}
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
                            e.stopPropagation();
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
    </div>
  );
} 