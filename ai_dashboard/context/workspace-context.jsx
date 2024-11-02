"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const WorkspaceContext = createContext({
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
  loadWorkspaces: () => {},
  workspaces: [],
});

export function WorkspaceProvider({ children }) {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);

  const loadWorkspaces = async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading workspaces:', error);
      return;
    }

    setWorkspaces(data || []);
    if (!currentWorkspace && data?.length > 0) {
      const defaultWorkspace = data.find(w => w.is_default) || data[0];
      setCurrentWorkspace(defaultWorkspace);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider value={{ 
      currentWorkspace, 
      setCurrentWorkspace, 
      workspaces,
      loadWorkspaces 
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);