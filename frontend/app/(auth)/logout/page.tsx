'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const redirect = setTimeout(() => router.push("/"), 2000);
    return () => clearTimeout(redirect);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-lg space-y-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-900">Successfully Logged Out</h1>
        <p className="text-sm text-gray-500">Redirecting you to the home page...</p>
      </div>
    </div>
  );
};

export default LogoutPage;