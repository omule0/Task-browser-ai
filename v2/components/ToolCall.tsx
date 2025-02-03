"use client";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formatValue = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(v => formatValue(v)).join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${formatValue(v)}`)
      .join(', ');
  }
  return String(value);
};

const ToolCall = ({
  name,
  args,
  result,
}: {
  name: string;
  args: any;
  result?: any;
}) => {
  const [isResultVisible, setIsResultVisible] = useState(false);

  let parsedArgs: Record<string, any> | null = null;
  try {
    if (typeof args === "string") {
      parsedArgs = JSON.parse(args);
    } else if (typeof args === "object") {
      parsedArgs = args;
    }
  } catch (_) {
    // incomplete JSON, no-op
  }

  let resultObject: Record<string, any> | null = null;
  let resultString: string | null = null;
  let isResultDefined = false;
  try {
    resultString = result;
    if (resultString) {
      isResultDefined = true;
      resultObject = JSON.parse(resultString);
      resultString = null;
    }
  } catch (_) {
    // incomplete JSON, no-op
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm relative flex flex-col gap-2">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
        <Badge variant="secondary" className="text-xs font-medium">
          {name}
        </Badge>
        {isResultDefined && (
          <button
            onClick={() => setIsResultVisible(!isResultVisible)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            {isResultVisible ? "Hide details" : "Show details"}
          </button>
        )}
      </div>

      {parsedArgs && (
        <div className="space-y-1.5">
          {Object.entries(parsedArgs).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">{key}</span>
              <span className="text-sm text-foreground">{formatValue(value)}</span>
            </div>
          ))}
        </div>
      )}

      {isResultDefined && (
        <div
          className={cn(
            "space-y-2 overflow-hidden transition-all duration-300",
            isResultVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs font-medium text-muted-foreground">Result</span>
            <div className="mt-1 text-sm text-foreground">
              {resultObject ? (
                <div className="space-y-1.5">
                  {Object.entries(resultObject).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">{key}</span>
                      <span className="text-sm text-foreground">{formatValue(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                resultString && <p>{resultString}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCall;
