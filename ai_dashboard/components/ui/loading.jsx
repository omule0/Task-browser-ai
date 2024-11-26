export function Loading() {
  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 bg-background"
      role="status"
      aria-label="Loading content"
    >
      <div className="space-y-6 text-center">
        {/* Enhanced spinner with multiple elements for better visual feedback */}
        <div className="relative mx-auto h-16 w-16">
          {/* Outer ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20"></div>
          {/* Inner spinning element */}
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
        
        {/* Enhanced loading text with fade-in animation */}
        <div className="space-y-2 animate-fade-in">
          <p className="text-lg font-medium text-primary">Loading...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </div>
    </div>
  );
} 