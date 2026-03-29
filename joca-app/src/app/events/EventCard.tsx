"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Camera,
  Clock,
  MapPin,
} from "lucide-react";
import { ClientDate } from "@/app/events/clientDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BorderBeam } from "@/components/ui/border-beam";
import type { Event } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export const EventCard = ({ event }: { event: Event }) => {
  const [open, setOpen] = React.useState(false);

  const handleViewDetails = () => {
    setOpen(true);
  };

  return (
    <>
      <Card className="h-full flex flex-col relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl pb-2">{event.title}</CardTitle>
          <CardDescription className="flex flex-col gap-2 md:text-lg sm:text-sm">
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

        {/* Footer stays at bottom */}
        <CardFooter className="mt-auto">
          <div className="flex flex-wrap gap-6 justify-between w-full">
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
                onClick={() => {}}
                variant="outline"
              >
                <Bookmark className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p>{event.description}</p>
            <section>
              <div className="flex flex-col justify-center gap-2">
                <div className="flex items-center gap-2">
                  <p>Location:</p>
                  <em className="text-primary font-semibold">
                    {event.location}
                  </em>
                </div>
                <div className="flex items-center gap-2">
                  <p>Date:</p>
                  <em className="text-secondary font-semibold">
                    <ClientDate date={event.date} />
                  </em>
                </div>
                <div className="flex items-center gap-2">
                  <p>Time:</p>
                  <em>{formatTime(event.time)}</em>
                </div>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
