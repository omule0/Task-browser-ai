"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Box, ChevronDown, PlusCircle } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";

export function WorkspaceSwitcher({ onAction, isCollapsed }) {
  const { currentWorkspace, setCurrentWorkspace, workspaces } = useWorkspace();
  const router = useRouter();

  const handleWorkspaceChange = (workspace) => {
    setCurrentWorkspace(workspace);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full p-0 h-auto hover:bg-transparent ${
            isCollapsed ? "items-center justify-center" : ""
          }`}
        >
          <div className={`flex items-center gap-3 ${isCollapsed ? "flex-col" : ""}`}>
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {currentWorkspace?.name ? (
                  <span className="text-primary font-medium">
                    {currentWorkspace.name[0].toUpperCase()}
                  </span>
                ) : (
                  <Box className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {currentWorkspace?.name || "Select workspace"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceChange(workspace)}
            className={`gap-2 ${currentWorkspace?.id === workspace.id ? "bg-accent" : ""}`}
          >
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-xs font-medium">
                {workspace.name[0].toUpperCase()}
              </span>
            </div>
            {workspace.name}
          </DropdownMenuItem>
        ))}
        {workspaces.length < 3 && (
          <DropdownMenuItem
            onClick={() => {
              router.push('/create-workspace');
              onAction?.();
            }}
            className="gap-2 text-primary bg-purple-100"
          >
            <PlusCircle className="h-4 w-4" />
            Create Workspace
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}