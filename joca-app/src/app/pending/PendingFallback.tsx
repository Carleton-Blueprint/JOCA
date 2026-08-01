import { Loader } from "@/components/ui/loader";

export function PendingFallback() {
  return (
    <div
      className="container mx-auto max-w-2xl p-8"
      aria-busy="true"
      aria-label="Loading application status"
    >
      <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
        <div className="h-7 w-2/3 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse" />
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      </div>
    </div>
  );
}
