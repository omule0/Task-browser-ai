export default function SkeletonMessage() {
  return (
    <div className="flex justify-start mb-4 relative animate-fade-in">
      <div className="absolute left-0 top-4 w-8 h-8 rounded-full bg-muted animate-pulse" 
           style={{ transform: "translateX(-120%)" }} />
      <div className="w-full max-w-3xl p-5 rounded-3xl bg-muted/5">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
