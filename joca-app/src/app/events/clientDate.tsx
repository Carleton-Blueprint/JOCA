"use client";

export function ClientDate({ date }: { date: string }) {
  if (!date) return <span>N/A</span>;

  // Split on "T" to handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ssZ".
  // Constructing with (year, month, day) treats the date as local midnight,
  // preventing UTC offset from shifting the displayed day for Ottawa users.
  const [year, month, day] = date.split("T")[0].split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return <span>{localDate.toLocaleDateString()}</span>;
}
