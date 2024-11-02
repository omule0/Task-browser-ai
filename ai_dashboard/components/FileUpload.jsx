"use client";
import { useWorkspace } from "@/context/workspace-context";
import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function FileUpload() {
  const { currentWorkspace } = useWorkspace();

  const handleUpload = async (file) => {
    if (!currentWorkspace) {
      toast.error('Please select a workspace first');
      return;
    }

    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    
    const { error } = await supabase.storage
      .from('documents')
      .upload(`${currentWorkspace.id}/${user.id}/${file.name}`, file);

    if (error) {
      toast.error('Error uploading file');
      return;
    }

    toast.success('File uploaded successfully');
  };

  // Rest of your component...
} 