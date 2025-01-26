import { Settings2, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"

export type Model = "gpt-4o-mini";
export type StreamMode = "messages" | "values" | "updates" | "events";

interface SettingsProps {
  onModelChange: (model: Model) => void;
  onSystemInstructionsChange: (instructions: string) => void;
  onStreamModeChange: (mode: StreamMode) => void;
  currentModel: Model;
  currentSystemInstructions: string;
  currentStreamMode: StreamMode;
}

export default function AgentSettings({
  onModelChange,
  onSystemInstructionsChange,
  onStreamModeChange,
  currentModel,
  currentSystemInstructions,
  currentStreamMode,
}: SettingsProps) {
  const models: Model[] = ["gpt-4o-mini"];
  const streamModes: StreamMode[] = ["messages", "values", "updates", "events"];
  const [isStreamOpen, setIsStreamOpen] = useState(false);
  const [enabledModels, setEnabledModels] = useState<Record<Model, boolean>>({
    "gpt-4o-mini": true
  });

  const handleModelToggle = (model: Model) => {
    setEnabledModels((prev) => {
      const newState = { ...prev, [model]: !prev[model] };
      // If we're enabling this model, make it the current model
      if (newState[model]) {
        onModelChange(model);
      }
      return newState;
    });
  };

  return (
    <div className="flex justify-center items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 h-8"
          >
            <Settings2 className="h-4 w-4" />
            <span className="text-sm font-medium">Preferences</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          <DropdownMenuLabel>Agent Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 text-xs font-medium">Model</DropdownMenuLabel>
            {models.map((model) => (
              <DropdownMenuItem
                key={model}
                className="gap-2 px-2 py-1.5"
                onSelect={(e) => {
                  e.preventDefault();
                  if (enabledModels[model]) {
                    onModelChange(model);
                  }
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={currentModel === model && enabledModels[model] ? "font-medium" : ""}>
                    {model}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentModel === model && enabledModels[model] && (
                      <span className="text-xs text-muted-foreground">Selected</span>
                    )}
                    <Switch
                      checked={enabledModels[model]}
                      onCheckedChange={() => handleModelToggle(model)}
                      aria-label={`Enable ${model}`}
                    />
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <Collapsible open={isStreamOpen} onOpenChange={setIsStreamOpen} className="w-full">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between px-2 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                  <span>Stream Mode</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isStreamOpen ? 'transform rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {streamModes.map((mode) => (
                  <DropdownMenuItem
                    key={mode}
                    className="gap-2"
                    onSelect={() => onStreamModeChange(mode)}
                  >
                    <span className={currentStreamMode === mode ? "font-medium" : ""}>
                      {mode}
                    </span>
                    {currentStreamMode === mode && (
                      <span className="ml-auto text-xs text-muted-foreground">Selected</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <DropdownMenuLabel className="text-xs font-medium">System Instructions</DropdownMenuLabel>
            <Textarea
              value={currentSystemInstructions}
              onChange={(e) => onSystemInstructionsChange(e.target.value)}
              className="mt-2 min-h-[100px] resize-none"
              placeholder="Enter system instructions..."
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
