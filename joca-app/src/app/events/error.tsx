"use client";

import { ListLoadError } from "@/components/ListLoadError";

export default function EventsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ListLoadError
      title="Couldn't load events"
      description="We couldn't reach the events service right now. This is usually temporary — please try again."
      reset={reset}
    />
  );
}
