"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, FolderTree, Users, Vote } from "lucide-react";
import Link from "next/link";
import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { FlippingCard } from "@/components/ui/flipping-card";

export const products = Array.from({ length: 15 }, (_, index) => ({
  title: `Joca${index + 1}`,
  thumbnail: `/joca${index + 1}.jpg`,
}));

export function HomePage() {
  return (
    <>
      <HeroParallax products={products} />
      <nav className="flex gap-8 items-center justify-center">
        <Link href="signup">
          <InteractiveHoverButton>Become a Member</InteractiveHoverButton>
        </Link>
        <Link href="events">
          <InteractiveHoverButton>View Events</InteractiveHoverButton>
        </Link>
      </nav>
      <section className="w-full flex flex-wrap gap-8 items-center justify-center p-6 mb-16">
        <FlippingCard
          frontContent={
            <div className="flex flex-col items-center justify-center gap-4 mt-4">
              <CardTitle className="text-2xl font-bold">
                Cultural Events
              </CardTitle>
              <Calendar />
            </div>
          }
          backContent={
            <div>
              {" "}
              <CardDescription>
                Join us for festivals, workshops and gatherings celbrating
                Jamaican culture
              </CardDescription>
            </div>
          }
        />
        <FlippingCard
          frontContent={
            <div className="flex flex-col items-center justify-center gap-4 mt-4">
              <CardTitle className="text-2xl font-bold">Community</CardTitle>

              <Users className="mb-2" />
            </div>
          }
          backContent={
            <div>
              {" "}
              <CardDescription>
                Join us for festivals, workshops and gatherings celbrating
                Jamaican culture
              </CardDescription>
            </div>
          }
        />

        <FlippingCard
          frontContent={
            <div className="flex flex-col items-center justify-center gap-4 mt-4">
              <CardTitle className="text-2xl font-bold">
                Member Benefits
              </CardTitle>
              <Vote className="mb-2" />
            </div>
          }
          backContent={
            <div>
              <CardDescription>
                Voting rights, exclusing events, and more for active members
              </CardDescription>
            </div>
          }
        />
      </section>
    </>
  );
}
