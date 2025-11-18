
"use client";

export function ClientDate({ date }: { date: string }) {
    return <span>{new Date(date).toLocaleDateString()}</span>;
}
