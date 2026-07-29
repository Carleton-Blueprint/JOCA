"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ListLoadErrorProps = {
  title: string;
  description: string;
  reset: () => void;
};

export function ListLoadError({ title, description, reset }: ListLoadErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-64">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="rounded-full bg-muted p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
