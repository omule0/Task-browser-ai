"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signup } from "./actions";
import { useSearchParams } from "next/navigation";
import SignUpWithGoogleButton from "./googlesignup";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Suspense } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-full bg-primary hover:bg-primary/90"
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing up...
        </>
      ) : (
        "Sign Up"
      )}
    </Button>
  );
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="w-full max-w-sm space-y-8">
      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}
      {message && (
        <div className="p-4 text-sm text-success bg-success/10 rounded-md">
          {message}
        </div>
      )}
      <div className="flex flex-col items-center space-y-6">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <UserPlusIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Create an account
        </h1>
      </div>
      <form action={signup} className="space-y-6">
        <div className="space-y-2">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="name"
          >
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            type="text"
            autoCapitalize="words"
            autoComplete="name"
            className="border-border"
            required
          />
        </div>
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
            className="border-border"
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
            autoComplete="new-password"
            className="border-border"
            required
          />
        </div>
        <SubmitButton />
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">OR</span>
        </div>
      </div>
      <SignUpWithGoogleButton />
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary/90">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <>
      <title>Sign Up</title>
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <SignUpContent />
        </Suspense>
      </div>
    </>
  );
}

function UserPlusIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}
