"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useWorkspace } from "@/context/workspace-context";

export default function CreateWorkspace() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loadWorkspaces, setCurrentWorkspace, workspaces } = useWorkspace();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

      if (workspaceError) {
        throw new Error(`Workspace creation error: ${workspaceError.message}`);
      }

      // Add creator as workspace member
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) {
        throw new Error(`Member creation error: ${memberError.message}`);
      }

      toast.success("Workspace created successfully");

      setCurrentWorkspace(workspace);

      await loadWorkspaces();

      router.push("/");
    } catch (error) {
      console.error("Error details:", error);
      toast.error(error.message || "Error creating workspace");
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
                onChange={(e) => setName(e.target.value)}
                placeholder="My Workspace"
                required
                minLength={3}
                maxLength={50}
                className="border-gray-200"
              />
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
