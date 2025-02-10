import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonMessage() {
  return (
    <div className="flex justify-start mb-6 relative animate-fade-in">
      <div className="w-full max-w-3xl p-6 rounded-3xl bg-muted/5">
        <div className="space-y-4">
          <Skeleton className="h-5 w-[85%]" />
          <Skeleton className="h-5 w-[65%]" />
          <Skeleton className="h-5 w-[75%]" />
          <div className="pt-2">
            <Skeleton className="h-4 w-[40%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
