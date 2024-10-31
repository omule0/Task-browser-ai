import { GiftIcon, HelpCircleIcon } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { logout } from '../app/logout/actions';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <header className="bg-purple-900 text-white">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg font-bold">Digest.ai</Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              // Logged in navigation
              <>
                <Link href="/integrations" className="hover:text-purple-200 text-sm">
                  Integrations
                </Link>
                <Link href="/templates" className="hover:text-purple-200 text-sm">
                  Templates
                </Link>
                <GiftIcon className="w-6 h-6 cursor-pointer" />
                <HelpCircleIcon className="w-6 h-6 cursor-pointer" />
                <div className="relative group">
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center cursor-pointer">
                    <span className="font-semibold">
                      {user.user_metadata.full_name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </Link>
                    <form action={logout}>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Sign out
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              // Logged out navigation
              <>
                <Link href="/login" className="hover:text-purple-200 text-sm">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-white text-purple-900 px-4 py-1 rounded-md text-sm hover:bg-purple-50">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
} 