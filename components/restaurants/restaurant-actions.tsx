"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle, TrendingUp } from "lucide-react";

const TIERS = ["starter", "basic", "pro", "premium"];

export function RestaurantActions({ restaurant }: { restaurant: any }) {
  const router = useRouter();
  const [tier, setTier] = useState(restaurant.subscription_tier);
  const [loading, setLoading] = useState(false);

  async function handleTierChange() {
    setLoading(true);
    const res = await fetch(`/api/restaurants/${restaurant.id}/tier`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { alert(`Error: ${data.error}`); return; }
    router.refresh();
  }

  async function handlePause() {
    setLoading(true);
    const ep = restaurant.subscription_status === "cancelled" ? "reactivate" : "pause";
    const res = await fetch(`/api/restaurants/${restaurant.id}/${ep}`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { alert(`Error: ${data.error}`); return; }
    router.refresh();
  }

  return (
    <Card className="p-5 space-y-4">
      <h3 className="font-semibold text-slate-800">Manage Subscription</h3>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500">Change tier</label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          {TIERS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <Button onClick={handleTierChange} loading={loading} size="sm" className="w-full flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Apply Tier Change
        </Button>
      </div>

      <div className="border-t pt-4">
        <Button
          variant={restaurant.subscription_status === "cancelled" ? "default" : "outline"}
          onClick={handlePause}
          loading={loading}
          size="sm"
          className="w-full flex items-center gap-1.5"
        >
          {restaurant.subscription_status === "cancelled"
            ? <><PlayCircle className="w-3.5 h-3.5" /> Reactivate</>
            : <><PauseCircle className="w-3.5 h-3.5" /> Pause Subscription</>}
        </Button>
      </div>
    </Card>
  );
}
