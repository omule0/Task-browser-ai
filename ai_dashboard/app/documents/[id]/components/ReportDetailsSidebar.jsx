import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

export function ReportDetailsSidebar({ report }) {
  if (!report) return null;

  return (
    <div className="w-[300px] border-l bg-background">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium">Report Details</h3>
          <Separator className="my-2" />
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-4">
              {/* Document Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Document Type</label>
                <p className="text-sm">{report.document_type || "Not specified"}</p>
              </div>

              {/* Sub Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sub Type</label>
                <p className="text-sm">{report.sub_type || "Not specified"}</p>
              </div>

              {/* Workspace */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Workspace ID</label>
                <p className="text-sm">{report.workspace_id || "Not specified"}</p>
              </div>

              {/* Created At */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{report.created_at ? formatDate(report.created_at) : "Not specified"}</p>
              </div>

              {/* Source Files */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Source Files</label>
                {report.source_files && report.source_files.length > 0 ? (
                  <ul className="text-sm list-disc list-inside">
                    {report.source_files.map((file, index) => (
                      <li key={index} className="truncate">
                        {file.name || file}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No source files</p>
                )}
              </div>

              {/* Token Usage */}
              {report.token_usage && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Token Usage</label>
                  <div className="text-sm">
                    <p>Total: {report.token_usage.totalTokens || 0}</p>
                    <p>Prompt: {report.token_usage.promptTokens || 0}</p>
                    <p>Completion: {report.token_usage.completionTokens || 0}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {report.metadata && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Additional Metadata</label>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
                    {JSON.stringify(report.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 