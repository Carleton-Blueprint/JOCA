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

export const products = Array.from({ length: 15 }, (_, index) => ({
  title: `Joca${index + 1}`,
  thumbnail: `/joca${index + 1}.jpg`,
}));

export function HomePage() {
  return <HeroParallax products={products} />;
}
