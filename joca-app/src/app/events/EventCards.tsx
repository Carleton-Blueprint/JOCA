"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventCard } from "./EventCard";
import type { Event } from "@/lib/types";
import { EmptyState } from "@/components/ui/EmptyState";

const categories = ["All", "Culture", "Community", "Education"] as const;
type CategoryFilter = (typeof categories)[number];

export const EventCards = ({ events }: { events: Event[] }) => {
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("All");

  const filteredEvents = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory =
        activeCategory === "All" || event.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        event.title?.toLowerCase().includes(normalizedQuery) ||
        event.location?.toLowerCase().includes(normalizedQuery) ||
        event.description?.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory, events]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-center">
          <Input
            placeholder="Search events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-md"
            aria-label="Search events"
          />
          <div className="flex gap-2 flex-wrap justify-center items-center">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 min-h-64">
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Try adjusting your search or browse by category"
          />
        ) : (
          filteredEvents.map((event: Event) => (
            <EventCard event={event} key={event.documentId} />
          ))
        )}
      </section>
    </>
  );
};
