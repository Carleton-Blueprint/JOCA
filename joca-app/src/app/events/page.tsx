import { Suspense } from "react";
import { EventCards } from "./EventCards";
import { getEvents } from "@/lib/strapi";
import Loading from "../loading";

// Strapi fetch uses cache: "no-store", so this route must be dynamic at build time.
export const dynamic = "force-dynamic";

async function EventsList() {
  const events = await getEvents();
  return <EventCards events={events} />;
}

// No auth check necessary - spec says anyone can view events
export default function EventsPage() {
  return (
    <main className="w-full h-full flex flex-col gap-6 p-8">
      <section className="flex flex-col gap-3 items-center text-center">
        <h1 className="text-4xl sm:text-5xl font-bold">Events</h1>
        <p className="text-gray-500 max-w-2xl">
          Explore upcoming JOCA events. Search by name, location, or browse by
          category.
        </p>
      </section>
      <Suspense fallback={<Loading />}>
        <EventsList />
      </Suspense>
    </main>
  );
}
