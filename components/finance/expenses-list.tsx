"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  salary: "bg-blue-100 text-blue-700",
  hosting: "bg-purple-100 text-purple-700",
  tools: "bg-cyan-100 text-cyan-700",
  marketing: "bg-pink-100 text-pink-700",
  other: "bg-slate-100 text-slate-700",
};

export function ExpensesList({ expenses }: { expenses: any[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/finance/expenses/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  if (expenses.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">No expenses recorded yet</p>;
  }

  return (
    <div className="divide-y">
      {expenses.map((e) => (
        <div key={e.id} className="flex items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${CATEGORY_COLORS[e.category] ?? "bg-slate-100 text-slate-700"}`}>
              {e.category}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-slate-700 truncate">{e.description}</p>
              <p className="text-xs text-slate-400">{format(new Date(e.date), "d MMM yyyy")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-semibold text-slate-800">{formatCurrency(e.amount_usd)}</span>
            <button
              onClick={() => handleDelete(e.id)}
              disabled={deleting === e.id}
              className="text-slate-300 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
