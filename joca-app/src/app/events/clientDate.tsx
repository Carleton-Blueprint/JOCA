
"use client";

export function ClientDate({ date }: { date: string }) {
    if (!date) return <span>N/A</span>;
    return <span>{new Date(date).toLocaleDateString()}</span>;
}
