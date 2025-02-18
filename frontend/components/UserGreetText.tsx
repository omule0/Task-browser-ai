"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function UserGreetText() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center bg-gradient-to-b from-zinc-200 px-4 py-2 rounded-lg dark:from-zinc-800/30">
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="flex items-center bg-gradient-to-b from-zinc-200 px-4 py-2 rounded-lg dark:from-zinc-800/30">
        Welcome to&nbsp;
        <code className="font-mono font-bold">Digest AI</code>
      </p>
    );
  }

  return (
    <p className="flex items-center bg-gradient-to-b from-zinc-200 px-4 py-2 rounded-lg dark:from-zinc-800/30">
      Welcome back,&nbsp;
      <code className="font-mono font-bold">
        {profile.full_name || 'User'}
      </code>
    </p>
  );
}
