"use client";

import { ListLoadError } from "@/components/ListLoadError";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isCategoryEnumError = error.message?.includes("ENUM_EVENT_CATEGORY");

  return (
    <ListLoadError
      title="Couldn't load events"
      description={
        isCategoryEnumError
          ? "An event in the CMS has an invalid category (often an extra space or typo). Fix it in Strapi Admin → Events, republish, then try again."
          : "We couldn't reach the events service right now. This is usually temporary — please try again."
      }
      reset={reset}
    />
  );
}
