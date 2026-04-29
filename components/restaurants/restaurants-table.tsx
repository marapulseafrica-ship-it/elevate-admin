"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { ChevronRight, PauseCircle, PlayCircle, Loader2 } from "lucide-react";

const TIERS = ["starter", "basic", "pro", "premium"];

interface Restaurant {
  id: string; name: string; email: string; subscription_tier: string;
  subscription_status: string; subscription_expires_at: string | null;
  is_active: boolean; created_at: string; country: string;
}

export function RestaurantsTable({ restaurants }: { restaurants: Restaurant[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function changeTier(id: string, tier: string) {
    setBusyId(id);
    await fetch(`/api/restaurants/${id}/tier`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function togglePause(id: string, currentStatus: string) {
    setBusyId(id);
    const endpoint = currentStatus === "cancelled" ? "reactivate" : "pause";
    await fetch(`/api/restaurants/${id}/${endpoint}`, { method: "POST" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
            <th className="text-left font-medium px-5 py-3">Restaurant</th>
            <th className="text-left font-medium px-5 py-3">Tier</th>
            <th className="text-left font-medium px-5 py-3">Status</th>
            <th className="text-left font-medium px-5 py-3">Expires</th>
            <th className="text-left font-medium px-5 py-3">Joined</th>
            <th className="text-left font-medium px-5 py-3">Actions</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {restaurants.map((r) => {
            const busy = busyId === r.id;
            const expiry = r.subscription_expires_at ? new Date(r.subscription_expires_at) : null;
            const daysLeft = expiry ? differenceInDays(expiry, new Date()) : null;
            return (
              <tr key={r.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="text-sm font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.email}</div>
                </td>
                <td className="px-5 py-3">
                  <select
                    value={r.subscription_tier}
                    onChange={(e) => changeTier(r.id, e.target.value)}
                    disabled={busy}
                    className="text-xs border rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={r.subscription_status}>{r.subscription_status}</Badge>
                </td>
                <td className="px-5 py-3">
                  {expiry ? (
                    <span className={`text-xs font-medium ${daysLeft !== null && daysLeft < 0 ? "text-red-500" : daysLeft !== null && daysLeft <= 7 ? "text-amber-500" : "text-slate-600"}`}>
                      {format(expiry, "d MMM yyyy")}
                      {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && <span className="ml-1">({daysLeft}d)</span>}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-5 py-3 text-xs text-slate-500">
                  {format(new Date(r.created_at), "d MMM yyyy")}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => togglePause(r.id, r.subscription_status)}
                    disabled={busy}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                      r.subscription_status === "cancelled"
                        ? <><PlayCircle className="w-3.5 h-3.5 text-green-500" /> Reactivate</>
                        : <><PauseCircle className="w-3.5 h-3.5 text-amber-500" /> Pause</>
                    }
                  </button>
                </td>
                <td className="px-5 py-3">
                  <Link href={`/restaurants/${r.id}`} className="text-purple-600 hover:text-purple-700">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
          {restaurants.length === 0 && (
            <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No restaurants found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
