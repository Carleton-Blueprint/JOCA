"use client"

import Image from "next/image";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useQuery } from "@apollo/client/react";
import { GET_EVENTS } from "./utils";
import { Event, GetEventsData } from "@/types/graphql";

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


export default function Home() {

  return (
    <div className="font-sans flex flex-col items-center justify-items-center min-h-screen gap-42">
      <Header />
      <section className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <section className="flex flex-col gap-6 justify-center mb-10">
          <h1 className="text-5xl font-bold max-w-xl text-center">
            Welcome To JOCA
          </h1>
          <p className="max-w-xl text-gray-500 text-center text-lg px-12">
            Jamaican Ottawa Community Association - Building community through
            culture, connection, and celebration
          </p>
          <nav className="flex gap-8 items-center justify-center">
            <Button>Become a Member</Button>
            <Button variant="outline">View Events</Button>
          </nav>
        </section>
      </section>
      <section className="w-full flex gap-8 items-center justify-center p-12">
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
      <Footer />
    </div>

  );
}