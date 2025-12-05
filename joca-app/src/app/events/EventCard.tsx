"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, CalendarDays, Camera, Clock, MapPin } from "lucide-react";
import { ClientDate } from "@/app/events/clientDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BorderBeam } from "@/components/ui/border-beam";
import { EventItem } from "./page";

function formatTime(timeStr: string) {
  if (!timeStr) return "N/A";

  const [h, m] = timeStr.split(":");
  let hour = Number(h);

  const suffix = hour < 12 ? " a.m" : " p.m";

  // Convert to 12-hour format:
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;

  return `${hour}:${m} ${suffix}`;
}

export default function EventCard({ event }: { event: EventItem }) {
  const [open, setOpen] = React.useState(false);

  const handleViewDetails = () => {
    console.log("view details");
    setOpen(true);
  };

  const onSave = () => {
    console.log("save");
  };

  return (
    <>
      <Card className="h-full flex flex-col relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl pb-2">{event.title}</CardTitle>
          <CardDescription className="flex flex-col gap-1 text-lg">
            <span className="inline-flex items-center gap-2 dark:text-white">
              <CalendarDays className="opacity-70" />
              <ClientDate date={event.date} />
              <span className="text-muted-foreground">•</span>
              <span className="inline-flex items-center gap-2">
                <Clock className="opacity-70" />
                {formatTime(event.time)}
              </span>
            </span>
            <span className="inline-flex dark:text-white items-center gap-2">
              <MapPin className="opacity-70" />
              {event.location ?? "N/A"}
            </span>
          </CardDescription>
        </CardHeader>

        {/* Content grows but does NOT push footer inconsistently */}
        <CardContent className="flex-grow">
          <p className="text-md dark:text-white">{event.description}</p>
        </CardContent>

        {/* Footer stays at bottom */}
        <CardFooter className="mt-auto">
          <div className="flex justify-between w-full">
            {event.category ? (
              <span className="text-sm px-2 py-1 rounded-md border bg-secondary">
                {event.category}
              </span>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <Button
                className="hover:cursor-pointer"
                size="sm"
                onClick={handleViewDetails}
              >
                View details
              </Button>
              <Button
                className="hover:cursor-pointer"
                size="sm"
                onClick={onSave}
                variant="outline"
              >
                Save
              </Button>
            </div>
          </div>
        </CardFooter>
        <BorderBeam
          duration={6}
          size={400}
          className="from-transparent via-green-500 to-transparent"
        />
        <BorderBeam
          duration={6}
          delay={3}
          size={400}
          borderWidth={2}
          className="from-transparent via-yellow-500 to-transparent"
        />
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p>
              Maybe more descriptive text section. Lorem ipsum dolor sit, amet
              consectetur adipisicing elit. Rerum recusandae delectus,
              repudiandae beatae quod voluptatum culpa quo nobis deserunt
              excepturi totam hic temporibus, nulla quibusdam officiis
              distinctio doloremque ad atque!{" "}
            </p>
            <section className="flex flex-col">
              <div className="grid grid-cols-[20%_1fr] items-center">
                <p>Location:</p>
                <Button
                  variant="link"
                  className="justify-start text-md hover:cursor-pointer p-0"
                >
                  {" "}
                  <em>{event.location}</em>
                </Button>
                <p>Date:</p>
                <em>
                  <ClientDate date={event.date} />
                </em>
                <p>Time:</p>
                <em>{formatTime(event.time)}</em>
              </div>
            </section>
            <footer className="flex gap-2 items-center justify-center">
              <Button className="flex-1">
                {" "}
                <CalendarDays />
                Add to Calender
              </Button>
              <Button className="flex-1">
                <Camera />
                See Post
              </Button>
              <Button className="flex-1">
                {" "}
                <Bell /> RSVP
              </Button>
            </footer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
