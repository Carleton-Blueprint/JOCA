"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@apollo/client/react";
import { GET_EVENTS } from "@/lib/utils";
import { EventCard } from "./EventCard";
import Loading from "../loading";

export type EventItem = {
  id: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // e.g. 6:00 PM
  location: string;
  description: string;
  category: "Culture" | "Community" | "Education";
  isPublic: boolean;
};

export interface GetEventsData {
  events: EventItem[];
}

const categories = ["All", "Culture", "Community", "Education"] as const;
type CategoryFilter = (typeof categories)[number];

export function EventCards() {
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("All");

  const { loading, error, data } = useQuery<GetEventsData>(GET_EVENTS);
  console.log(data);

  const filteredEvents = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data?.events.filter((event) => {
      const matchesCategory =
        activeCategory === "All" || event.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        event.title?.toLowerCase().includes(normalizedQuery) ||
        event.location?.toLowerCase().includes(normalizedQuery) ||
        event.description?.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory, data]);

  if (loading) return <Loading />;

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
        {error ? (
          <p>Error: {error.message}</p>
        ) : (
          filteredEvents?.map((event, index) => (
            <EventCard event={event} key={index} />
          ))
        )}
      </section>
    </>
  );
}
