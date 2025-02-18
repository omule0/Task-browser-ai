"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

interface UserMetadata {
  avatar_url?: string;
  email?: string;
  full_name?: string;
  name?: string;
  picture?: string;
}

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata: UserMetadata;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
}

const UserGreetText = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log('UserGreetText - User Data:', user);
      setUser(user);
    };
    fetchUser();
  }, []);

  if (user !== null) {
    const displayName = user.user_metadata.name || user.user_metadata.full_name || "user";
    return (
      <p className="flex items-center bg-gradient-to-b from-zinc-200 px-4 py-2 rounded-lg dark:from-zinc-800/30">
        Welcome back,&nbsp;
        <code className="font-mono font-bold">{displayName}</code>
      </p>
    );
  }
  return (
    <p className="flex items-center bg-gradient-to-b from-zinc-200 px-4 py-2 rounded-lg dark:from-zinc-800/30">
      Welcome to&nbsp;
      <code className="font-mono font-bold">Digest AI</code>
    </p>
  );
};

export default UserGreetText;
