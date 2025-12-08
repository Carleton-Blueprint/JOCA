"use client";

import { CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { FlippingCard } from "@/components/ui/flipping-card";
import { HeroSection } from "@/components/ui/hero-section";
import { GradientSlideButton } from "@/components/ui/gradient-slide-button";

export const products = Array.from({ length: 15 }, (_, index) => ({
  title: `Joca${index + 1}`,
  thumbnail: `/joca${index + 1}.jpg`,
}));

export function HomePage() {
  return (
    <>
      <HeroParallax products={products} />
      <HeroSection />
      <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl md:text-4xl lg:text-5xl mb-6">
        Become Involved In:
      </h1>
      <section className="w-full flex flex-wrap gap-8 items-center justify-center p-6 mb-4">
        <FlippingCard
          className="min-h-[425px]"
          frontContent={
            <div className="flex p-4 flex-col justify-start gap-4 m-4 h-full overflow-hidden">
              <Image
                src={"/joca1.jpg"}
                alt={"joca1"}
                width={350}
                height={250}
                className="w-full h-full max-h-[300px] rounded-md object-cover flex-shrink"
              />
              <CardTitle className="text-xl font-bold">
                Cultural Events
              </CardTitle>
              <p className="text-muted-foreground mb-4">
                Join us for festivals, workshops and gatherings celebrating
                Jamaican culture
              </p>
            </div>
          }
          backContent={
            <div className="flex p-4 flex-col items-center justify-center gap-4 mt-4 h-full overflow-hidden">
              {" "}
              <p className="text-center text-muted-foreground mb-4">
                Join us for festivals, workshops and gatherings celebrating
                Jamaican culture
              </p>
              <Link href="/events">
                <GradientSlideButton colorFrom="#006400" colorTo="#32cd32">
                  Learn More
                </GradientSlideButton>
              </Link>
            </div>
          }
        />
        <FlippingCard
          className="min-h-[425px]"
          frontContent={
            <div className="flex p-8 flex-col justify-start gap-4 m-4 h-full overflow-hidden">
              <Image
                src={"/joca2.jpg"}
                alt={"joca2"}
                width={350}
                height={250}
                className="w-full h-full max-h-[250px] rounded-md object-cover flex-shrink"
              />
              <CardTitle className="text-xl font-bold">Community</CardTitle>
              <p className="text-muted-foreground mb-4">
                Join us in a vibrant and inclusive community
              </p>
            </div>
          }
          backContent={
            <div className="flex p-4 flex-col items-center justify-center gap-4 mt-4 h-full overflow-hidden">
              {" "}
              <p className="text-center text-muted-foreground mb-4">
                Join us in a vibrant and inclusive community that celebrates
                Jamaican culture and heritage
              </p>
              <Link href="/about">
                <GradientSlideButton colorFrom="#006400" colorTo="#32cd32">
                  Learn More
                </GradientSlideButton>
              </Link>
            </div>
          }
        />

        <FlippingCard
          className="min-h-[425px]"
          frontContent={
            <div className=" flex p-4 flex-col justify-start gap-4 m-4 h-full overflow-hidden">
              <Image
                src={"/joca3.jpg"}
                alt={"joca3"}
                width={350}
                height={250}
                className="w-full h-full max-h-[250px] rounded-md object-cover flex-shrink"
              />
              <CardTitle className="text-xl font-bold">
                Member Benefits
              </CardTitle>
              <p className="text-muted-foreground mb-4">
                Voting rights, exclusive events, and more for active members
              </p>
            </div>
          }
          backContent={
            <div className="flex p-4 flex-col items-center justify-center gap-4 mt-4 h-full overflow-hidden">
              {" "}
              <p className="text-center text-muted-foreground mb-4">
                Voting rights, exclusive events, and more for active members
              </p>
              <Link href="/signup">
                <GradientSlideButton colorFrom="#006400" colorTo="#32cd32">
                  Learn More
                </GradientSlideButton>
              </Link>
            </div>
          }
        />
      </section>
    </>
  );
}
