import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Clock, Database, Zap, Info } from "lucide-react";

export function ReportDetailsSidebar({ report }) {
  if (!report) return null;

  return (
    <aside className="w-[300px] border-l flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Fixed header */}
      <div className="h-[60px] flex items-center px-6 border-b">
        <h3 className="font-semibold">Report Details</h3>
      </div>
      
      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {/* Basic Info Section */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex w-full justify-between p-2 hover:bg-muted rounded-md group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Basic Information</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                <p className="text-sm">{report.document_type || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Sub Type</label>
                <p className="text-sm">{report.sub_type || "Not specified"}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-4" />

          {/* Timing Info */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex w-full justify-between p-2 hover:bg-muted rounded-md group"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Timing</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{report.created_at ? formatDate(report.created_at) : "Not specified"}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-4" />

          {/* Source Files */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex w-full justify-between p-2 hover:bg-muted rounded-md group"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Source Files</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2 pt-2">
              {report.source_files && report.source_files.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {report.source_files.map((file, index) => {
                    const fileName = file.split('/').pop();
                    return (
                      <li key={index} className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{fileName}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No source files</p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {report.token_usage && (
            <>
              <Separator className="my-4" />
              
              <Collapsible defaultOpen>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex w-full justify-between p-2 hover:bg-muted rounded-md group"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Token Usage</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span>{report.token_usage.totalTokens || 0}</span>
                    <span className="text-muted-foreground">Prompt:</span>
                    <span>{report.token_usage.promptTokens || 0}</span>
                    <span className="text-muted-foreground">Completion:</span>
                    <span>{report.token_usage.completionTokens || 0}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {report.metadata && (
            <>
              <Separator className="my-4" />
              
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex w-full justify-between p-2 hover:bg-muted rounded-md group"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Additional Metadata</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pt-2">
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
                    {JSON.stringify(report.metadata, null, 2)}
                  </pre>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
} 