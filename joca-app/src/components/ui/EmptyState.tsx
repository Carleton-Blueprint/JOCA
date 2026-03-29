import { cn } from "@/lib/utils";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export const EmptyState = ({ 
  title = "No items found", 
  description = "Try adjusting your search or filters",
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "col-span-full flex flex-col items-center justify-center py-16 px-4",
      className
    )}>
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="rounded-full bg-muted p-4">
          <SearchX className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
