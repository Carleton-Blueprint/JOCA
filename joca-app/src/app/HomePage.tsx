"use client";
import { Button } from "@/components/ui/button";

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
      <section className="w-full flex gap-8 items-center justify-center p-6 mb-16">
        <Card className="w-xs">
          <CardHeader>
            <Calendar className="mb-2" />
            <CardTitle>Cultural Events</CardTitle>
            <CardDescription>
              Join us for festivals, workshops and gatherings celbrating
              Jamaican culture
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="w-xs">
          <CardHeader>
            <Users className="mb-2" />
            <CardTitle>Community</CardTitle>
            <CardDescription>
              Connect with fellow members and building lasting friendships
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="w-xs">
          <CardHeader>
            <Vote className="mb-2" />
            <CardTitle>Member Benefits</CardTitle>
            <CardDescription>
              Voting rights, exclusing events, and more for active members
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </>
  );
}
