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
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { ClientDate } from "../events/clientDate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BorderBeam } from "@/components/ui/border-beam";
import { ElectionItem, Candidate } from "./page";
import { formatTime } from "@/lib/utils";

export default function ElectionCard({ election }: { election: ElectionItem }) {
  const [open, setOpen] = React.useState(false);

  const handleViewDetails = () => {
    setOpen(true);
  };

  const onBallot = () => {
    if (election.ballotUrl) {
      window.open(election.ballotUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl pb-2">{election.title}</CardTitle>
          <CardDescription className="flex flex-col gap-1 text-lg">
            <span className="inline-flex items-center gap-2 dark:text-white">
              <CalendarDays className="opacity-70" />
              <ClientDate date={election.date} />
              <span className="text-muted-foreground">•</span>
              <span className="inline-flex items-center gap-2">
                <Clock className="opacity-70" />
                {formatTime(election.time)}
              </span>
            </span>
            <span className="inline-flex dark:text-white items-center gap-2">
              <MapPin className="opacity-70" />
              {election.location ?? "N/A"}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <p className="text-md dark:text-white">{election.description}</p>
        </CardContent>

        <CardFooter className="mt-auto">
          <div className="flex justify-between w-full items-center gap-2">
            <span className="text-sm px-2 py-1 rounded-md border bg-secondary">
              {election.category}
            </span>

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
                onClick={onBallot}
                variant="outline"
                disabled={!election.ballotUrl}
              >
                {election.ballotUrl ? "View ballot" : "Ballot soon"}
              </Button>
            </div>
          </div>
        </CardFooter>
        <BorderBeam
          duration={6}
          size={400}
          className="from-transparent via-emerald-500 to-transparent"
        />
        <BorderBeam
          duration={6}
          delay={3}
          size={400}
          borderWidth={2}
          className="from-transparent via-cyan-500 to-transparent"
        />
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{election.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-[32%_1fr] gap-y-2 text-sm">
              <span className="text-muted-foreground">Voting window</span>
              <span>
                {election.votingDateStart && election.votingDateEnd ? (
                  <>
                    <ClientDate date={election.votingDateStart} /> –{" "}
                    <ClientDate date={election.votingDateEnd} />
                  </>
                ) : (
                  "See details soon"
                )}
              </span>
              <span className="text-muted-foreground">Location</span>
              <span>{election.location}</span>
              <span className="text-muted-foreground">Date</span>
              <span>
                <ClientDate date={election.date} />
              </span>
              <span className="text-muted-foreground">Time</span>
              <span>{formatTime(election.time)}</span>
            </div>

            {election.candidates && election.candidates.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4" />
                  <span>Candidates</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {election.candidates.map((candidate: Candidate, idx: number) => (
                    <li key={idx}>{candidate.firstName} {candidate.lastName}</li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="flex gap-2 items-center justify-center">
              <Button className="flex-1" onClick={() => setOpen(false)}>
                Close
              </Button>
              {election.ballotUrl && (
                <Button className="flex-1" variant="secondary" onClick={onBallot}>
                  Go to ballot
                </Button>
              )}
            </footer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

