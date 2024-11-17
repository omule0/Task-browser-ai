"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, PlusCircle } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";

export function WorkspaceSwitcher({ onAction, isCollapsed }) {
  const { currentWorkspace, setCurrentWorkspace, workspaces } = useWorkspace();
  const router = useRouter();

  const handleWorkspaceChange = (workspace) => {
    setCurrentWorkspace(workspace);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`relative border-input bg-background hover:bg-accent hover:text-accent-foreground pl-3 text-left font-normal ${
              isCollapsed ? "w-10 p-0" : "w-[200px] justify-between"
            }`}
          >
            {!isCollapsed && (
              <span className="absolute -top-2.5 left-2 bg-background px-1 text-xs text-muted-foreground">
                Workspace
              </span>
            )}
            {isCollapsed ? (
              <span className="flex items-center justify-center w-full">
                {currentWorkspace?.name?.[0] ?? "W"}
              </span>
            ) : (
              <>
                {currentWorkspace?.name ?? "Select workspace"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceChange(workspace)}
              className={currentWorkspace?.id === workspace.id ? "bg-purple-50" : ""}
            >
              {workspace.name}
            </DropdownMenuItem>
          ))}
          {workspaces.length < 3 && (
            <DropdownMenuItem
              onClick={() => {
                router.push('/create-workspace');
                onAction?.();
              }}
              className="text-purple-600"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Workspace
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}