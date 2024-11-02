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

export function WorkspaceSwitcher() {
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
          <Button variant="outline" className="w-[200px] justify-between">
            {currentWorkspace?.name ?? "Select workspace"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
              onClick={() => router.push('/create-workspace')}
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