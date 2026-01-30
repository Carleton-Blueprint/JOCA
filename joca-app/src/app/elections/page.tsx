"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@apollo/client/react";
import { GET_ELECTIONS } from "@/lib/utils";
import ElectionCard from "./ElectionCard";

export type Candidate = {
  firstName: string;
  lastName: string;
};

export type ElectionItem = {
  documentId: string;
  title: string;
  date: string; // ISO date (YYYY-MM-DD)
  time: string; // 24h format e.g. "18:00"
  location: string;
  description: string;
  category: "Executive" | "Committee" | "Referendum";
  isPublic: boolean;
  votingDateStart: string; // ISO date (YYYY-MM-DD)
  votingDateEnd: string; // ISO date (YYYY-MM-DD)
  ballotUrl?: string;
  candidates?: Candidate[];
};

export interface GetElectionsData {
  elections: ElectionItem[];
}

const categories = ["All", "Executive", "Committee", "Referendum"] as const;
type CategoryFilter = (typeof categories)[number];

export default function ElectionsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  const [query, setQuery] = React.useState("");
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryFilter>("All");

  const { loading, error, data } = useQuery<GetElectionsData>(GET_ELECTIONS);

  // Wait for client-side hydration to complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isPending && !session?.user) {
      router.push("/signup");
    }
  }, [isMounted, isPending, session, router]);

  const filteredElections = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data?.elections.filter((election) => {
      const matchesCategory =
        activeCategory === "All" || election.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        election.title?.toLowerCase().includes(normalizedQuery) ||
        election.location?.toLowerCase().includes(normalizedQuery) ||
        election.description?.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory, data]);

  // Show loading state until hydration is complete
  if (!isMounted || isPending) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <p className="text-center text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <main className="w-full h-full flex flex-col gap-6 p-8">
      <section className="flex flex-col gap-3 items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-bold">Elections</h1>
        <p className="text-gray-500 max-w-2xl">
          Explore upcoming JOCA elections and referenda. Search by name,
          location, or browse by category.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-center">
          <Input
            placeholder="Search elections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:max-w-md"
            aria-label="Search elections"
          />
          <div className="flex justify-center items-center gap-2 flex-wrap">
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

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-64">
        {error ? (
          <p className="text-muted-foreground">Error: {error.message}</p>
        ) : loading ? (
          <p className="text-muted-foreground">Loading elections...</p>
        ) : filteredElections?.length === 0 ? (
          <p className="text-muted-foreground">No elections found.</p>
        ) : (
          filteredElections?.map((election) => (
            <ElectionCard election={election} key={election.documentId} />
          ))
        )}
      </section>
    </main>
  );
}

