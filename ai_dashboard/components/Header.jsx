import {
  GiftIcon,
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { logout } from "../app/logout/actions";
// import { useWorkspace } from "@/context/workspace-context";
import { createClient } from "@/utils/supabase/server";

export async function Header() {
  // const { workspaces } = useWorkspace();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-purple-900 text-white">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg font-bold">
              Digest.ai
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  href="/integrations"
                  className="hover:text-purple-200 text-sm"
                >
                  Integrations
                </Link>
                <Link
                  href="/templates"
                  className="hover:text-purple-200 text-sm"
                >
                  Templates
                </Link>
                <GiftIcon className="w-6 h-6 cursor-pointer" />
                <HelpCircleIcon className="w-6 h-6 cursor-pointer" />
                {/* {workspaces.length >= 3 && (
              <Link 
                href="/workspacesettings" 
                className="relative group"
                title="Workspace limit reached"
              >
                <div className="absolute -top-1 -right-1">
                  <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                  </div>
                </div>
                <div className="invisible group-hover:visible absolute top-8 right-0 w-48 p-2 bg-white text-sm text-gray-700 rounded-md shadow-lg">
                  You've reached the maximum workspace limit
                </div>
              </Link>
            )} */}
                <div className="relative group">
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center cursor-pointer overflow-hidden">
                    {user.user_metadata.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-semibold">
                        {user.user_metadata.full_name?.[0] ||
                          user.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 invisible group-hover:visible
                before:absolute before:h-2 before:w-full before:-top-2 before:right-0"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div>
                        <div className="font-medium">
                          {user.user_metadata.full_name || "Profile"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {user.email}
                        </div>
                      </div>
                    </Link>
                    <Link
                      href="/workspacesettings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4" />
                        Workspace Settings
                        {/* {workspaces.length >= 3 && (
                      <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
                        <AlertCircle className="w-3 h-3 text-white" />
                      </div>
                    )} */}
                      </div>
                    </Link>
                    <form action={logout}>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          <LogOutIcon className="w-4 h-4" />
                          Sign out
                        </div>
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <>
              {/* todo: add something interactive */}
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
