import { Loader } from "@/components/ui/loader";

export function MembersListFallback() {
  return (
    <div aria-busy="true" aria-label="Loading members" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="h-10 flex-1 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-lg border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    </div>
  );
}
