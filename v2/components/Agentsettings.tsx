import { Settings2, ChevronDown, Cpu, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Model } from "@/types";

export type StreamMode = "messages" | "events" | "updates" | "values";

interface AgentSettingsProps {
  onModelChange: (model: Model) => void;
  onStreamModeChange: (mode: StreamMode) => void;
  currentModel: Model;
  currentStreamMode: StreamMode;
  className?: string;
}

export default function AgentSettings({
  onModelChange,
  onStreamModeChange,
  currentModel,
  currentStreamMode,
  className = "",
}: AgentSettingsProps) {
  const models: Model[] = ["gpt-4o-mini"];
  const streamModes: StreamMode[] = ["messages", "values", "updates", "events"];
  const [isStreamOpen, setIsStreamOpen] = useState(false);
  const [enabledModels, setEnabledModels] = useState<Record<Model, boolean>>({
    "gpt-4o-mini": true
  });

  const handleModelToggle = (model: Model) => {
    setEnabledModels((prev) => {
      const newState = { ...prev, [model]: !prev[model] };
      if (newState[model]) {
        onModelChange(model);
      }
      return newState;
    });
  };

  const getStreamModeIcon = (mode: StreamMode) => {
    switch (mode) {
      case "messages":
        return "💬";
      case "events":
        return "🔄";
      case "updates":
        return "📝";
      case "values":
        return "📊";
      default:
        return "⚡";
    }
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 h-9 px-4 hover:bg-primary/10 transition-colors duration-200"
          >
            <Settings2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Preferences</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[320px] backdrop-blur-lg bg-background/95"
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-primary">
            <Cpu className="h-4 w-4" />
            Agent Settings
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 text-xs font-medium text-muted-foreground">
              Model Selection
            </DropdownMenuLabel>
            {models.map((model) => (
              <DropdownMenuItem
                key={model}
                className="gap-2 px-3 py-2 hover:bg-primary/5 transition-colors duration-200"
                onSelect={(e) => {
                  e.preventDefault();
                  if (enabledModels[model]) {
                    onModelChange(model);
                  }
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Zap className={`h-4 w-4 ${currentModel === model && enabledModels[model] ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`${currentModel === model && enabledModels[model] ? "font-medium text-primary" : ""}`}>
                      {model}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentModel === model && enabledModels[model] && (
                      <span className="text-xs text-primary">Active</span>
                    )}
                    <Switch
                      checked={enabledModels[model]}
                      onCheckedChange={() => handleModelToggle(model)}
                      className="data-[state=checked]:bg-primary"
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
                <div className="flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-primary/5 cursor-pointer transition-colors duration-200">
                  <span>Stream Mode</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isStreamOpen ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="animate-slideDown">
                {streamModes.map((mode) => (
                  <DropdownMenuItem
                    key={mode}
                    className="gap-2 px-3 py-2 hover:bg-primary/5 transition-colors duration-200"
                    onSelect={() => onStreamModeChange(mode)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStreamModeIcon(mode)}</span>
                      <span className={currentStreamMode === mode ? "font-medium text-primary" : ""}>
                        {mode}
                      </span>
                    </div>
                    {currentStreamMode === mode && (
                      <span className="ml-auto text-xs text-primary">Selected</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}