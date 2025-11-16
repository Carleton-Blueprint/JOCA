"use client";

import * as React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Clock, MapPin } from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // e.g. 6:00 PM
  location: string;
  description: string;
  category: "Culture" | "Community" | "Education";
};

const mockEvents: EventItem[] = [
  {
    id: "1",
    title: "Reggae Night: Live Music & Dance",
    date: "2025-11-08",
    time: "7:00 PM",
    location: "Centretown Community Hall",
    description:
      "An evening of live reggae, dance, and community vibes. All ages welcome.",
    category: "Culture",
  },
  {
    id: "2",
    title: "Community Potluck & Mixer",
    date: "2025-11-15",
    time: "5:30 PM",
    location: "Ottawa South Community Centre",
    description:
      "Share a dish, meet neighbours, and learn about upcoming JOCA initiatives.",
    category: "Community",
  },
  {
    id: "3",
    title: "Youth Scholarship Info Session",
    date: "2025-11-22",
    time: "6:00 PM",
    location: "Virtual (Zoom)",
    description:
      "Q&A and guidance for students applying to JOCA's 2026 scholarship program.",
    category: "Education",
  },
  {
    id: "4",
    title: "Cultural Cooking Workshop",
    date: "2025-12-01",
    time: "6:30 PM",
    location: "Vanier Kitchen Co-op",
    description:
      "Hands-on workshop exploring traditional Jamaican dishes and culinary history.",
    category: "Culture",
  },
  {
    id: "5",
    title: "Volunteer Orientation Night",
    date: "2025-12-05",
    time: "6:00 PM",
    location: "JOCA Office, Bank St.",
    description:
      "Learn about open volunteer roles and how to contribute to upcoming events.",
    category: "Community",
  },
  {
    id: "6",
    title: "Financial Literacy for Newcomers",
    date: "2025-12-10",
    time: "7:00 PM",
    location: "Sandy Hill Centre",
    description:
      "Workshop covering budgeting, credit, and saving strategies tailored for newcomers.",
    category: "Education",
  },
];

const categories = ["All", "Culture", "Community", "Education"] as const;
type CategoryFilter = (typeof categories)[number];

export default function EventsPage() {
  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("All");

  const filteredEvents = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return mockEvents.filter((event) => {
      const matchesCategory =
        activeCategory === "All" || event.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.location.toLowerCase().includes(normalizedQuery) ||
        event.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="flex justify-center items-center min-h-screen flex-col">
      <Header />

      <main className="w-full  flex flex-col gap-6 p-8">
        <section className="flex flex-col gap-3 items-center text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">Events</h1>
          <p className="text-gray-500 max-w-2xl">
            Explore upcoming JOCA events. Search by name, location, or browse by
            category.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Input
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="sm:max-w-md"
              aria-label="Search events"
            />
            <div className="flex gap-2 flex-wrap">
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
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {filteredEvents.length} event
              {filteredEvents.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="opacity-70" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="opacity-70" />
                      {event.time}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="opacity-70" />
                    {event.location}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{event.description}</p>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs px-2 py-1 rounded-md border bg-secondary">
                  {event.category}
                </span>
                <div className="flex gap-2">
                  <Button size="sm">View details</Button>
                  <Button size="sm" variant="outline">
                    Save
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
