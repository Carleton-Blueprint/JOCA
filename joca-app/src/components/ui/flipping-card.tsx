"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";

interface FlippingCardProps {
  className?: string;
  height?: number;
  width?: number;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
}

export function FlippingCard({
  className,
  frontContent,
  backContent,
  height = 350,
  width = 350,
}: FlippingCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="[perspective:1000px]"
      style={
        {
          "--height": `${height}px`,
          "--width": `${width}px`,
        } as React.CSSProperties
      }
      onClick={() => setIsFlipped((f) => !f)}
    >
      <div
        className={cn(
          "relative rounded-xl border border-neutral-200 bg-white shadow-lg transition-all duration-700 [transform-style:preserve-3d] dark:border-neutral-800 dark:bg-neutral-950",
          isFlipped && "[transform:rotateY(180deg)]",
          "h-[var(--height)] w-[var(--width)]",
          className
        )}
      >
        {/* Front Face */}
        <div className="absolute inset-0 h-full w-full [transform:rotateY(0deg)] rounded-[inherit] bg-white text-neutral-950 [backface-visibility:hidden] [transform-style:preserve-3d] dark:bg-zinc-950 dark:text-neutral-50">
          <div className="relative h-full w-full overflow-hidden rounded-[inherit] pb-10 [transform:translateZ(70px)_scale(.93)]">
            {frontContent}
            <span className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-all duration-200 hover:scale-105 hover:bg-black/20 hover:text-neutral-900 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20 dark:hover:text-neutral-100">
              Tap to flip ↩
            </span>
          </div>
        </div>
        {/* Back Face */}
        <div className="absolute inset-0 h-full w-full [transform:rotateY(180deg)] rounded-[inherit] bg-white text-neutral-950 [backface-visibility:hidden] [transform-style:preserve-3d] dark:bg-zinc-950 dark:text-neutral-50">
          <div className="relative h-full w-full overflow-hidden rounded-[inherit] pb-10 [transform:translateZ(70px)_scale(.93)]">
            {backContent}
            <span className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-all duration-200 hover:scale-105 hover:bg-black/20 hover:text-neutral-900 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20 dark:hover:text-neutral-100">
              Tap to go back ↩
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
