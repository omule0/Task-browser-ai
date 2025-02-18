"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const UserGreetText = () => {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);
    if (user !== null) {
      return (
        <p className="flex items-center bg-gradient-to-b from-zinc-200 px-4 py-2 rounded-lg dark:from-zinc-800/30">
          Welcome back,&nbsp;
          <code className="font-mono font-bold">{user.full_name ?? "user"}</code>
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
