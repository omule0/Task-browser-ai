"use client";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "./actions";
import { FcGoogle } from 'react-icons/fc'
import React from "react";

const SignInWithGoogleButton = () => {
  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          signInWithGoogle();
        }}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Login with Google
      </Button>
    </div>
  );
};

export default SignInWithGoogleButton;