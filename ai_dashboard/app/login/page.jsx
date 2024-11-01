"use client";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import SignInWithGoogleButton from "./googlesignin";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full bg-[#663399] hover:bg-[#552288]"
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing In...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

export default function LoginPage() {
  return (
    <>
      <title>Sign In</title>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {message && (
          <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
            {message}
          </div>
        )}
        <div className="flex flex-col items-center space-y-6">
          <div className="h-12 w-12 rounded-lg bg-[#663399]/10 flex items-center justify-center">
            <LockIcon className="h-6 w-6 text-[#663399]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back!
          </h1>
        </div>
        <form action={login} className="space-y-6">
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              placeholder="you@company.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="border-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              className="border-gray-200"
              required
            />
          </div>
          <LoginButton />
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#F8F8F9] px-2 text-gray-500">OR</span>
          </div>
        </div>
        <SignInWithGoogleButton />
        <div className="flex items-center justify-between">
          <Link
            href="https://digestai-p5wpa.ondigitalocean.app"
            className="text-sm text-[#663399] hover:text-[#552288] flex items-center gap-1"
          >
            <HiArrowLeft className="h-4 w-4" />
            Website
          </Link>
          <div className="text-sm">
            No account?{" "}
            <Link
              href="/signup"
              className="text-[#663399] hover:text-[#552288] inline-flex items-center gap-1"
            >
              Sign Up
              <HiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
