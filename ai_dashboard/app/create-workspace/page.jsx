"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { customToast } from "@/components/ui/toast-theme";
import { useWorkspace } from "@/context/workspace-context";

export default function CreateWorkspace() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { loadWorkspaces, setCurrentWorkspace, workspaces } = useWorkspace();

  if (workspaces.length >= 3) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Workspace Limit Reached</h1>
            <p className="text-gray-600 mt-2">
              You can only create up to 3 workspaces. Please delete an existing workspace to create a new one.
            </p>
          </div>
          <Button
            onClick={() => router.push('/workspacesettings')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Manage Workspaces
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Auth error: ${userError.message}`);
      }

      if (!user) {
        throw new Error("No user found");
      }

      // Check for duplicate workspace name
      const { data: existingWorkspace, error: nameCheckError } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .ilike("name", name.trim())
        .single();

      if (nameCheckError && nameCheckError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw nameCheckError;
      }

      if (existingWorkspace) {
        setError("A workspace with this name already exists");
        return;
      }

      // Check workspace count
      const { data: existingWorkspaces, error: countError } = await supabase
        .from("workspaces")
        .select("id");

      if (countError) throw countError;

      if (existingWorkspaces && existingWorkspaces.length >= 3) {
        throw new Error("You can only create up to 3 workspaces");
      }

      // Create new workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .insert({
          name: name.trim(),
          owner_id: user.id,
          is_default: existingWorkspaces.length === 0,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      customToast.success("Workspace created successfully");

      setCurrentWorkspace(workspace);

      await loadWorkspaces();

      router.push("/");
    } catch (error) {
      console.error("Error details:", error);
      setError(error.message || "Error creating workspace");
      customToast.error(error.message || "Error creating workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Create Workspace</title>
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create Your Workspace</h1>
            <p className="text-gray-600 mt-2">
              This will be your default workspace for managing files and
              collaborating with others.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Workspace Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(""); // Clear error when user types
                }}
                placeholder="My Workspace"
                required
                minLength={3}
                maxLength={50}
                className={`border-gray-200 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading || name.length < 3}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
