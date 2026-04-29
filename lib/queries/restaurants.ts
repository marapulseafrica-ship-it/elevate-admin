import { supabaseAdmin } from "../supabase";

export async function getAllRestaurants() {
  const { data } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, email, slug, subscription_tier, subscription_status, subscription_expires_at, is_active, created_at, country")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getRestaurantDetail(id: string) {
  const [{ data: restaurant }, { count: customerCount }, { data: campaigns }, { data: payments }, { data: notes }] = await Promise.all([
    supabaseAdmin
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single(),
    supabaseAdmin
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id),
    supabaseAdmin
      .from("campaigns")
      .select("id, name, status, sent_count, delivered_count, created_at")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("payments")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("restaurant_notes")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const completedCampaigns = campaigns?.filter((c) => c.status === "completed") ?? [];
  const totalSent = completedCampaigns.reduce((s, c) => s + (c.sent_count ?? 0), 0);
  const totalDelivered = completedCampaigns.reduce((s, c) => s + (c.delivered_count ?? 0), 0);

  return {
    restaurant,
    customerCount: customerCount ?? 0,
    campaigns: campaigns ?? [],
    totalSent,
    totalDelivered,
    payments: payments ?? [],
    notes: notes ?? [],
  };
}

export async function getRestaurantStats() {
  const { data } = await supabaseAdmin
    .from("restaurants")
    .select("subscription_status, subscription_tier, subscription_expires_at");
  const all = data ?? [];
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    total: all.length,
    active: all.filter((r) => r.subscription_status === "active" || r.subscription_status === "trial").length,
    expired: all.filter((r) => r.subscription_status === "expired").length,
    expiringSoon: all.filter((r) => {
      if (!r.subscription_expires_at) return false;
      const exp = new Date(r.subscription_expires_at);
      return exp > now && exp <= in7Days && r.subscription_status === "active";
    }).length,
    byTier: {
      starter: all.filter((r) => r.subscription_tier === "starter").length,
      basic: all.filter((r) => r.subscription_tier === "basic").length,
      pro: all.filter((r) => r.subscription_tier === "pro").length,
      premium: all.filter((r) => r.subscription_tier === "premium").length,
    },
  };
}
