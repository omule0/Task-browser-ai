"use client";
import {
  GiftIcon,
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function HeaderUI({ user, logout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async (formData) => {
    handleMenuItemClick();
    await logout(formData);
  };

  return (
    <header className="bg-purple-900 text-white z-10 relative">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg font-bold">
              Digest.ai
            </Link>
          </div>
          {user && (
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          )}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
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
                      </div>
                    </Link>
                    <form action={handleSignOut}>
                      <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <LogOutIcon className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-purple-200 text-sm">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          {user && isMobileMenuOpen && (
            <div className="absolute top-12 left-0 right-0 bg-purple-900 p-4 md:hidden">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/integrations"
                  className="hover:text-purple-200 text-sm"
                  onClick={handleMenuItemClick}
                >
                  Integrations
                </Link>
                <Link
                  href="/templates"
                  className="hover:text-purple-200 text-sm"
                  onClick={handleMenuItemClick}
                >
                  Templates
                </Link>
                <div className="flex space-x-4" onClick={handleMenuItemClick}>
                  <GiftIcon className="w-6 h-6 cursor-pointer" />
                  <HelpCircleIcon className="w-6 h-6 cursor-pointer" />
                </div>
                <Link
                  href="/profile"
                  className="flex items-center space-x-2"
                  onClick={handleMenuItemClick}
                >
                  <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
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
                  <div>
                    <div className="font-medium">
                      {user.user_metadata.full_name || "Profile"}
                    </div>
                    <div className="text-sm opacity-75">{user.email}</div>
                  </div>
                </Link>
                <Link
                  href="/workspacesettings"
                  className="flex items-center space-x-2"
                  onClick={handleMenuItemClick}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Workspace Settings</span>
                </Link>
                <form action={handleSignOut}>
                  <button className="flex items-center space-x-2 text-white">
                    <LogOutIcon className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
} 