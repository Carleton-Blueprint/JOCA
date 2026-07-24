"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { ClientDate } from "../events/clientDate";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BorderBeam } from "@/components/ui/border-beam";
import type { Election, Candidate } from "@/lib/types";
import { voteForCandidate } from "@/lib/actions";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { toast } from "sonner";

export const ElectionCard = ({
  election,
  initialHasVoted,
}: {
  election: Election;
  initialHasVoted: boolean;
}) => {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] =
    React.useState<Candidate | null>(election.candidates?.[0] ?? null);
  const [open, setOpen] = React.useState(false);
  const [voting, setVoting] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(initialHasVoted);

  React.useEffect(() => {
    setHasVoted(initialHasVoted);
  }, [initialHasVoted]);

  const handleVote = async () => {
    if (!selectedCandidate) return;
    setVoting(true);
    try {
      await voteForCandidate(
        selectedCandidate.documentId,
        election.documentId,
      );
      setOpen(false);
      setHasVoted(true);
      router.refresh();
      toast.success("Vote submitted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit vote.",
      );
    } finally {
      setVoting(false);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col relative overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl pb-2">{election.title}</CardTitle>
          <CardDescription className="flex flex-col gap-1 text-lg">
            <span className="inline-flex flex-wrap mb-2 items-center gap-2 text-black dark:text-muted-foreground">
              <CalendarDays className="opacity-70" />
              Voting Window:
              <ClientDate date={election.votingDateStart} /> –{" "}
              <ClientDate date={election.votingDateEnd} />
            </span>
            <span className="inline-flex dark:text-white items-center gap-2">
              <MapPin className="opacity-70" />
              {election.location ?? "N/A"}
            </span>
          </CardDescription>
        </CardHeader>

        <CardFooter className="mt-auto">
          <div className="flex flex-wrap gap-6 justify-between w-full">
            <span className="text-sm px-2 py-1 rounded-md border bg-secondary">
              {election.category}
            </span>

            <div className="flex gap-2">
              <Button
                className="hover:cursor-pointer"
                size="sm"
                onClick={() => setOpen(true)}
                disabled={
                  hasVoted ||
                  (election.candidates?.length ?? 0) < 2 ||
                  !(new Date(election.votingDateStart) <= new Date()) ||
                  !(new Date(election.votingDateEnd) >= new Date())
                }
              >
                {hasVoted ? "Vote submitted" : "View details & Vote"}
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
          <DialogDescription>
            {election.description || "No description available"}{" "}
          </DialogDescription>
          <div className="space-y-4">
            <div className="flex flex-col gap-y-2 text-sm">
              <span className="text-muted-foreground">
                Voting window:{" "}
                {election.votingDateStart && election.votingDateEnd ? (
                  <span className="text-black dark:text-white ml-2">
                    <ClientDate date={election.votingDateStart} /> –{" "}
                    <ClientDate date={election.votingDateEnd} />
                  </span>
                ) : (
                  "See details soon"
                )}
              </span>
            </div>

            {election.candidates && election.candidates.length > 1 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold pt-8 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <Users className="size-6" />
                  <span className="text-xl">Candidates</span>
                </div>
                <RadioGroup
                  defaultValue={election.candidates[0]?.documentId ?? null}
                  onValueChange={(value: string) => {
                    setSelectedCandidate(
                      election.candidates?.find(
                        (candidate: Candidate) =>
                          candidate.documentId === value,
                      ) ?? null,
                    );
                  }}
                >
                  {election.candidates?.map((candidate: Candidate) => (
                    <div
                      key={candidate.documentId}
                      className="flex items-center gap-2"
                    >
                      <FieldLabel htmlFor={candidate.documentId}>
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>
                              {candidate.member?.firstName ?? "N/A"}{" "}
                              {candidate.member?.lastName ?? "N/A"}
                            </FieldTitle>

                            <RadioGroupItem
                              value={candidate.documentId}
                              id={candidate.documentId}
                              className="text-black dark:text-white p-2"
                            />
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    </div>
                  ))}
                </RadioGroup>
              </section>
            )}
            <footer className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="cursor-pointer"
                    disabled={hasVoted || voting}
                  >
                    {hasVoted
                      ? "Vote submitted"
                      : voting
                        ? "Submitting..."
                        : "Vote"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Submit Vote</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Are you sure you want to submit your vote for{" "}
                    {selectedCandidate?.member?.firstName ?? "N/A"}{" "}
                    {selectedCandidate?.member?.lastName ?? "N/A"}? This action
                    cannot be undone.
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      className="cursor-pointer"
                      variant="destructive"
                      onClick={handleVote}
                      disabled={voting || hasVoted}
                    >
                      Submit Vote
                    </Button>
                    <DialogClose asChild>
                      <Button className="cursor-pointer" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </footer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
