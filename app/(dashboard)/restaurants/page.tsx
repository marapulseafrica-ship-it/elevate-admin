export const dynamic = 'force-dynamic';

import { getAllRestaurants } from "@/lib/queries/restaurants";
import { Card } from "@/components/ui/card";
import { RestaurantsTable } from "@/components/restaurants/restaurants-table";

interface PageProps { searchParams: { status?: string } }

export default async function RestaurantsPage({ searchParams }: PageProps) {
  const all = await getAllRestaurants();
  const filter = searchParams.status ?? "all";

  const filtered = filter === "all" ? all : all.filter((r) => r.subscription_status === filter);

  const tabs = [
    { id: "all", label: "All", count: all.length },
    { id: "active", label: "Active", count: all.filter((r) => r.subscription_status === "active").length },
    { id: "trial", label: "Trial", count: all.filter((r) => r.subscription_status === "trial").length },
    { id: "expired", label: "Expired", count: all.filter((r) => r.subscription_status === "expired").length },
    { id: "cancelled", label: "Cancelled", count: all.filter((r) => r.subscription_status === "cancelled").length },
  ];

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Restaurants</h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <a
            key={t.id}
            href={`/restaurants?status=${t.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === t.id ? "bg-purple-600 text-white" : "bg-white border text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </a>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <RestaurantsTable restaurants={filtered} />
      </Card>
    </div>
  );
}
