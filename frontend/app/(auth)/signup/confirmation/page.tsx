import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpConfirmationPage() {
  return (
    <div className="flex h-svh items-center justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center text-2xl">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a confirmation email. Please check your inbox and follow the instructions to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>If you don&apos;t see the email, please check your spam folder.</p>
        </CardContent>
      </Card>
    </div>
  );
} 