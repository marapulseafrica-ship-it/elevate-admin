import { supabaseAdmin } from "../supabase";
import { subDays, subMonths } from "date-fns";

export async function getUsageAndChurn() {
  const since30 = subDays(new Date(), 30).toISOString();
  const since60 = subDays(new Date(), 60).toISOString();
  const lastMonth = subMonths(new Date(), 1).toISOString();

  const [{ data: restaurants }, { data: recentCampaigns }, { data: recentCustomers }] = await Promise.all([
    supabaseAdmin
      .from("restaurants")
      .select("id, name, email, subscription_tier, subscription_status, subscription_expires_at, created_at"),
    supabaseAdmin
      .from("campaigns")
      .select("restaurant_id, created_at, sent_count, delivered_count, status")
      .gte("created_at", since60),
    supabaseAdmin
      .from("customers")
      .select("restaurant_id, created_at")
      .gte("created_at", since30),
  ]);

  return (restaurants ?? []).map((r) => {
    const myCampaigns30 = (recentCampaigns ?? []).filter(
      (c) => c.restaurant_id === r.id && c.created_at >= since30
    );
    const myCampaigns60 = (recentCampaigns ?? []).filter((c) => c.restaurant_id === r.id);
    const myNewCustomers = (recentCustomers ?? []).filter((c) => c.restaurant_id === r.id).length;
    const totalSent = myCampaigns30.reduce((s, c) => s + (c.sent_count ?? 0), 0);
    const totalDelivered = myCampaigns30.reduce((s, c) => s + (c.delivered_count ?? 0), 0);

    // Churn risk score
    let score = 0;
    if (myCampaigns30.length === 0) score += 40;
    if (myNewCustomers === 0) score += 20;
    if (r.subscription_status === "expired" || r.subscription_status === "cancelled") score += 20;
    if (myCampaigns60.length === 0) score += 20;

    const risk: "Low" | "Medium" | "High" = score <= 30 ? "Low" : score <= 60 ? "Medium" : "High";

    return {
      id: r.id,
      name: r.name,
      email: r.email,
      tier: r.subscription_tier,
      status: r.subscription_status,
      campaignsLast30: myCampaigns30.length,
      newCustomersLast30: myNewCustomers,
      messagesSent: totalSent,
      messagesDelivered: totalDelivered,
      churnScore: score,
      churnRisk: risk,
    };
  });
}

export async function getRetentionSummary() {
  const { data } = await supabaseAdmin
    .from("restaurants")
    .select("subscription_status, subscription_tier");
  const all = data ?? [];
  return {
    active: all.filter((r) => r.subscription_status === "active").length,
    trial: all.filter((r) => r.subscription_status === "trial").length,
    expired: all.filter((r) => r.subscription_status === "expired").length,
    cancelled: all.filter((r) => r.subscription_status === "cancelled").length,
  };
}
