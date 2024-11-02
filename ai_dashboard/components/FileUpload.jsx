"use client";
import { useWorkspace } from "@/context/workspace-context";
import { createClient } from "@/utils/supabase/client";
import { customToast } from "@/components/ui/toast-theme";

export function FileUpload() {
  const { currentWorkspace } = useWorkspace();

  const handleUpload = async (file) => {
    if (!currentWorkspace) {
      customToast.error('Please select a workspace first');
      return;
    }

    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;
    
    const { error } = await supabase.storage
      .from('documents')
      .upload(`${currentWorkspace.id}/${user.id}/${file.name}`, file);

    if (error) {
      customToast.error('Error uploading file');
      return;
    }

    customToast.success('File uploaded successfully');
  };

  // Rest of your component...
} 