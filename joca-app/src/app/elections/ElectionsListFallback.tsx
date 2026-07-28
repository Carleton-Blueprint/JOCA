import { Loader } from "@/components/ui/loader";

export function ElectionsListFallback() {
  return (
    <div
      className="flex flex-col gap-4 min-h-64"
      aria-busy="true"
      aria-label="Loading elections"
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-center">
        <div className="h-10 sm:max-w-md w-full rounded-md bg-muted animate-pulse" />
        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-20 rounded-md bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    </div>
  );
}
