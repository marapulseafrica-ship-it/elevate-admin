export const dynamic = 'force-dynamic';

import { getRestaurantDetail } from "@/lib/queries/restaurants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RestaurantActions } from "@/components/restaurants/restaurant-actions";
import { RestaurantNotes } from "@/components/restaurants/restaurant-notes";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, Globe } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RestaurantDetailPage({ params }: { params: { id: string } }) {
  const { restaurant, customerCount, campaigns, totalSent, totalDelivered, payments, notes } = await getRestaurantDetail(params.id);
  if (!restaurant) notFound();

  const totalRevenue = payments.filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + Number(p.amount_usd), 0);

  const churnScore = (() => {
    const last30 = new Date(Date.now() - 30 * 86400000).toISOString();
    const last30campaigns = campaigns.filter((c: any) => c.created_at >= last30);
    let score = 0;
    if (last30campaigns.length === 0) score += 40;
    if (restaurant.subscription_status === "expired" || restaurant.subscription_status === "cancelled") score += 20;
    return score;
  })();
  const churnRisk = churnScore <= 30 ? "Low" : churnScore <= 60 ? "Medium" : "High";

  const statCards = [
    { label: "Customers", value: customerCount },
    { label: "Campaigns sent", value: campaigns.filter((c: any) => c.status === "completed").length },
    { label: "Messages sent", value: totalSent },
    { label: "Total revenue", value: formatCurrency(totalRevenue) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/restaurants" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{restaurant.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={restaurant.subscription_tier}>{restaurant.subscription_tier}</Badge>
            <Badge variant={restaurant.subscription_status}>{restaurant.subscription_status}</Badge>
            <Badge variant={churnRisk.toLowerCase()}>{churnRisk} churn risk</Badge>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-slate-800">Profile</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4" />{restaurant.email}</div>
            {restaurant.whatsapp_number && <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4" />{restaurant.whatsapp_number}</div>}
            <div className="flex items-center gap-2 text-slate-600"><Globe className="w-4 h-4" />{restaurant.country} · {restaurant.timezone}</div>
          </div>
          <div className="pt-2 border-t space-y-1.5 text-xs text-slate-500">
            <div>Joined: {format(new Date(restaurant.created_at), "d MMMM yyyy")}</div>
            {restaurant.subscription_expires_at && (
              <div>Expires: {format(new Date(restaurant.subscription_expires_at), "d MMMM yyyy")}</div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <RestaurantActions restaurant={restaurant} />

        {/* Payment history */}
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b"><h3 className="font-semibold text-slate-800 text-sm">Payment History</h3></div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {payments.filter((p: any) => p.status === "completed").length === 0 && (
              <p className="px-5 py-6 text-xs text-slate-400 text-center">No completed payments</p>
            )}
            {payments.filter((p: any) => p.status === "completed").map((p: any) => (
              <div key={p.id} className="px-5 py-2.5 flex justify-between items-center">
                <div className="text-xs font-medium capitalize text-slate-700">{p.plan}</div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-800">{p.amount_zmw ? `ZMW ${Number(p.amount_zmw).toFixed(0)}` : `$${p.amount_usd}`}</div>
                  <div className="text-xs text-slate-400">{p.completed_at ? format(new Date(p.completed_at), "d MMM yyyy") : "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notes */}
      <RestaurantNotes restaurantId={params.id} initialNotes={notes} />
    </div>
  );
}
