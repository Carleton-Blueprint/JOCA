"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MemberCard, type MemberCardData } from "./MemberCard";

const PAGE_SIZE = 9;

export function MembersList({
  members,
  currentUserId,
  query,
}: {
  members: MemberCardData[];
  currentUserId: string;
  query: string;
}) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(PAGE_SIZE, members.length),
  );

  const visible = members.slice(0, visibleCount);
  const remaining = members.length - visibleCount;
  const singleColumn = visible.length === 1;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing {visible.length} of {members.length}
        {members.length >= 50 ? " (most recent 50 loaded)" : ""} member
        {members.length === 1 ? "" : "s"}
        {query ? ` matching “${query}”` : ""}.
      </p>

      <div className={singleColumn ? undefined : "grid gap-6 md:grid-cols-2"}>
        {visible.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isSelf={member.id === currentUserId}
          />
        ))}
      </div>

      {remaining > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + PAGE_SIZE, members.length),
              )
            }
          >
            Show more ({Math.min(PAGE_SIZE, remaining)} of {remaining}{" "}
            remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
