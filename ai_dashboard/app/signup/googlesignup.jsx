"use client"
import { Button } from "@/components/ui/button"
import { signupWithGoogle } from "./actions"
import { FcGoogle } from 'react-icons/fc'

const SignUpWithGoogleButton = () => {
  return (
    <Button 
      variant="outline" 
      className="w-full border-gray-200" 
      type="button"
      onClick={() => signupWithGoogle()}
    >
      <FcGoogle className="mr-2 h-4 w-4" />
      Sign up with Google
    </Button>
  )
}

export default SignUpWithGoogleButton 