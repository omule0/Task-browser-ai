export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-4xl font-bold text-foreground">System Maintenance</h1>
        <div className="animate-bounce my-8">
          <span className="text-6xl">��</span>
        </div>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          We're currently performing system maintenance to improve your experience.
          Please check back soon.
        </p>
      </div>
    </div>
  );
} 