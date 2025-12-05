"use client";

import { CardTitle } from "@/components/ui/card";
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
        <Link href="about">
          <InteractiveHoverButton>About Us</InteractiveHoverButton>
        </Link>
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
            <div className="flex flex-col items-center justify-start  gap-4 mt-4 h-full overflow-hidden">
              <CardTitle className="text-3xl font-bold">
                Cultural Events
              </CardTitle>

              <img
                src={"/joca1.jpg"}
                alt={"joca1"}
                className="w-full h-full max-h-[250px]  rounded-md object-cover flex-shrink"
              />
            </div>
          }
          backContent={
            <div className="flex flex-col items-center justify-center gap-4 mt-4 h-full overflow-hidden">
              {" "}
              <p className="text-2xl mt-2 text-center ">
                Join us for festivals, workshops and gatherings celbrating
                Jamaican culture
              </p>
            </div>
          }
        />
        <FlippingCard
          frontContent={
            <div className="flex flex-col items-center justify-start gap-4 mt-4 h-full overflow-hidden">
              <CardTitle className="text-3xl font-bold">Community</CardTitle>

              <img
                src={"/joca2.jpg"}
                alt={"joca2"}
                className="w-full h-full  max-h-[250px]  rounded-md object-cover flex-shrink"
              />
            </div>
          }
          backContent={
            <div className="flex flex-col items-center justify-center gap-4 mt-4 h-full overflow-hidden">
              {" "}
              <p className="text-2xl mt-2 text-center ">
                Join us in a vibrant and inclusive community that celebrates
                Jamaican culture and heritage
              </p>
            </div>
          }
        />

        <FlippingCard
          frontContent={
            <div className="flex flex-col items-center justify-start gap-4 mt-4 h-full overflow-hidden">
              <CardTitle className="text-3xl font-bold">
                Member Benefits
              </CardTitle>
              <img
                src={"/joca3.jpg"}
                alt={"joca3"}
                className="w-full h-full max-h-[250px] rounded-md object-cover flex-shrink"
              />{" "}
            </div>
          }
          backContent={
            <div className="flex flex-col items-center justify-center gap-4 mt-4 h-full overflow-hidden">
              {" "}
              <p className="text-2xl mt-2 text-center ">
                Voting rights, exclusing events, and more for active members
              </p>
            </div>
          }
        />
      </section>
    </>
  );
}
