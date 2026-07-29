"use client";

import { ListLoadError } from "@/components/ListLoadError";

export default function ElectionsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ListLoadError
      title="Couldn't load elections"
      description="Something went wrong while loading elections. Please try again in a moment."
      reset={reset}
    />
  );
}
