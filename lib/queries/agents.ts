import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "../supabase";

export async function getAllAgents() {
  noStore();
  const { data } = await supabaseAdmin
    .from("sales_agents")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAgentsOverview() {
  noStore();
  const { data } = await supabaseAdmin.rpc("get_agents_admin_overview");
  return (data ?? []) as any[];
}

export async function getAllAgentLeads() {
  noStore();
  const { data } = await supabaseAdmin
    .from("agent_leads")
    .select("*, sales_agents(full_name)")
    .order("claimed_at", { ascending: false })
    .limit(500);
  return (data ?? []).map((l: any) => ({
    ...l,
    agent_name: l.sales_agents?.full_name ?? "Unknown",
  }));
}

export async function getAllAgentConversions() {
  noStore();
  const { data } = await supabaseAdmin
    .from("agent_conversions")
    .select("*, sales_agents(full_name), restaurants(name)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((c: any) => ({
    ...c,
    agent_name: c.sales_agents?.full_name ?? "Unknown",
    restaurant_name: c.restaurants?.name ?? null,
  }));
}

export async function getAllAgentPayouts() {
  noStore();
  const { data } = await supabaseAdmin
    .from("agent_payouts")
    .select("*, sales_agents(full_name)")
    .order("month", { ascending: false });
  return (data ?? []).map((p: any) => ({
    ...p,
    agent_name: p.sales_agents?.full_name ?? "Unknown",
  }));
}

export async function getAgentStats() {
  noStore();
  const [agentsRes, leadsRes, conversionsRes, payoutsRes] = await Promise.all([
    supabaseAdmin.from("sales_agents").select("id, is_active"),
    supabaseAdmin
      .from("agent_leads")
      .select("id, qualified_calls")
      .gte("month", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)),
    supabaseAdmin.from("agent_conversions").select("id, activated_at"),
    supabaseAdmin.from("agent_payouts").select("total, status"),
  ]);

  const agents = agentsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const conversions = conversionsRes.data ?? [];
  const payouts = payoutsRes.data ?? [];

  return {
    total_agents: agents.length,
    active_agents: agents.filter((a: any) => a.is_active).length,
    month_calls: leads.reduce((s: number, l: any) => s + (l.qualified_calls ?? 0), 0),
    month_leads: leads.length,
    total_conversions: conversions.filter((c: any) => c.activated_at).length,
    unpaid_total: payouts
      .filter((p: any) => p.status !== "paid")
      .reduce((s: number, p: any) => s + Number(p.total ?? 0), 0),
  };
}
