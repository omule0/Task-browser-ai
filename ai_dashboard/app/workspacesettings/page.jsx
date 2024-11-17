"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Trash2, PencilIcon, CheckIcon, XIcon } from "lucide-react";
import { customToast } from "@/components/ui/toast-theme";
import { useWorkspace } from "@/context/workspace-context";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WorkspaceSettings() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const { currentWorkspace, loadWorkspaces: refreshWorkspaces } =
    useWorkspace();
  const router = useRouter();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error("Error loading workspaces:", error);
      customToast.error("Error loading workspaces");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (id) => {
    try {
      if (workspaces.length === 1) {
        customToast.error("You can't delete your last workspace");
        return;
      }

      setDeleting(id);
      const supabase = createClient();

      // Delete all files in the workspace
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.storage.from("documents").remove([`${id}/${user.id}`]);

      // Delete the workspace
      const { error } = await supabase.from("workspaces").delete().eq("id", id);

      if (error) throw error;

      customToast.success("Workspace deleted successfully");
      loadWorkspaces();
      refreshWorkspaces();
    } catch (error) {
      console.error("Error deleting workspace:", error);
      customToast.error("Error deleting workspace");
    } finally {
      setDeleting(null);
    }
  };

  const updateWorkspaceName = async (id) => {
    try {
      if (!editName.trim()) {
        customToast.error("Workspace name cannot be empty");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("workspaces")
        .update({ name: editName.trim() })
        .eq("id", id);

      if (error) throw error;

      customToast.success("Workspace name updated");
      loadWorkspaces();
      refreshWorkspaces();
      setEditing(null);
    } catch (error) {
      console.error("Error updating workspace:", error);
      customToast.error("Error updating workspace name");
    }
  };

  const setDefaultWorkspace = async (workspaceId) => {
    try {
      const supabase = createClient();

      // First, remove default status from all workspaces
      await supabase
        .from("workspaces")
        .update({ is_default: false })
        .neq("id", workspaceId);

      // Then set the selected workspace as default
      const { error } = await supabase
        .from("workspaces")
        .update({ is_default: true })
        .eq("id", workspaceId);

      if (error) throw error;

      customToast.success("Default workspace updated");
      loadWorkspaces();
      refreshWorkspaces();
    } catch (error) {
      console.error("Error updating default workspace:", error);
      customToast.error("Error updating default workspace");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <title>Workspace Settings</title>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workspace Settings</CardTitle>
                <CardDescription>Manage your workspaces</CardDescription>
              </div>
              {workspaces.length < 3 && (
                <Button
                  onClick={() => router.push('/create-workspace')}
                  variant="outline"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Workspace
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {workspaces.length >= 3 && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-purple-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-purple-800">
                      Workspace Limit Reached
                    </h3>
                    <div className="mt-1 text-sm text-purple-700">
                      <p>
                        You have reached the maximum limit of 3 workspaces. To
                        create a new workspace, you'll need to delete an existing
                        one first.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <Card key={workspace.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      {editing === workspace.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Workspace name"
                          />
                          <button
                            onClick={() => updateWorkspaceName(workspace.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="p-1 text-gray-600 hover:text-gray-700"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{workspace.name}</span>
                          {workspace.is_default && (
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!workspace.is_default && (
                        <button
                          onClick={() => setDefaultWorkspace(workspace.id)}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          Set as Default
                        </button>
                      )}
                      {!editing && (
                        <button
                          onClick={() => {
                            setEditing(workspace.id);
                            setEditName(workspace.name);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Edit workspace name"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteWorkspace(workspace.id)}
                        disabled={
                          deleting === workspace.id || workspaces.length === 1
                        }
                        className={`p-1 ${
                          workspaces.length === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-500 hover:text-red-600"
                        }`}
                        title={
                          workspaces.length === 1
                            ? "Can't delete last workspace"
                            : "Delete workspace"
                        }
                      >
                        {deleting === workspace.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
