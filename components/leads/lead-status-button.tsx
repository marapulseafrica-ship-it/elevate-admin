"use client";
import { useState } from "react";
import { cycleLeadStatus } from "@/app/actions/leads";

export function LeadStatusButton({
  id,
  status,
  styleMap,
}: {
  id: string;
  status: string;
  styleMap: Record<string, string>;
}) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await cycleLeadStatus(id, current);
      const cycle: Record<string, string> = { new: "contacted", contacted: "booked", booked: "closed", closed: "new" };
      setCurrent(cycle[current] ?? "new");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Click to advance status"
      className={`text-xs font-semibold px-2 py-1 rounded-full capitalize cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${styleMap[current] ?? "bg-slate-100 text-slate-500"}`}
    >
      {current}
    </button>
  );
}
