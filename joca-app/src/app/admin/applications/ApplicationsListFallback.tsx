import { Loader } from "@/components/ui/loader";

export function ApplicationsListFallback() {
  return (
    <div aria-busy="true" aria-label="Loading applications" className="space-y-6">
      <div className="h-4 w-48 rounded-md bg-muted animate-pulse" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-48 rounded-lg border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    </div>
  );
}
