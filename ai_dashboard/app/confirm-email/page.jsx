export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="h-12 w-12 rounded-lg bg-[#663399]/10 flex items-center justify-center">
            <EmailIcon className="h-6 w-6 text-[#663399]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Check your email</h1>
        </div>
        <p className="text-gray-600">
          We've sent you a confirmation link. Please check your email and click the link to verify your account.
        </p>
      </div>
    </div>
  )
}

function EmailIcon() {
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
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
} 