import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AgentNotificationsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("id").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  const [announcementsRes, followupsRes] = await Promise.all([
    supabaseAdmin.from("agent_announcements").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    supabaseAdmin
      .from("agent_leads")
      .select("id, restaurant_name, next_followup_date, status")
      .eq("agent_id", agent.id)
      .not("next_followup_date", "is", null)
      .order("next_followup_date"),
  ]);

  const announcements = announcementsRes.data ?? [];
  const followups = followupsRes.data ?? [];
  const overdueFollowups = followups.filter(f => new Date(f.next_followup_date) <= new Date());
  const upcomingFollowups = followups.filter(f => new Date(f.next_followup_date) > new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
        <p className="text-sm text-slate-500">Announcements and follow-up reminders</p>
      </div>

      {overdueFollowups.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-red-200">
            <h2 className="text-sm font-semibold text-red-800">🔴 Overdue Follow-ups ({overdueFollowups.length})</h2>
          </div>
          <div className="divide-y divide-red-100">
            {overdueFollowups.map((f: any) => (
              <div key={f.id} className="px-5 py-3 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-800">{f.restaurant_name}</div>
                <div className="text-xs text-red-600 font-medium">{format(new Date(f.next_followup_date), "dd MMM yyyy")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingFollowups.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-200">
            <h2 className="text-sm font-semibold text-amber-800">🟡 Upcoming Follow-ups ({upcomingFollowups.length})</h2>
          </div>
          <div className="divide-y divide-amber-100">
            {upcomingFollowups.map((f: any) => (
              <div key={f.id} className="px-5 py-3 flex items-center justify-between">
                <div className="text-sm font-medium text-slate-800">{f.restaurant_name}</div>
                <div className="text-xs text-amber-700 font-medium">{format(new Date(f.next_followup_date), "dd MMM yyyy")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {followups.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm text-emerald-700">
          ✓ No follow-ups pending. Set follow-up dates when logging calls in My Restaurants.
        </div>
      )}

      {/* Announcements */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-slate-700">📢 Announcements from ElevateAI</h2>
        </div>
        {announcements.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">No announcements yet.</div>
        ) : (
          <div className="divide-y">
            {announcements.map((a: any) => (
              <div key={a.id} className="px-5 py-4">
                <div className="text-sm font-semibold text-slate-800">{a.title}</div>
                <div className="text-sm text-slate-600 mt-1 leading-relaxed">{a.body}</div>
                <div className="text-xs text-slate-400 mt-2">{format(new Date(a.created_at), "d MMMM yyyy")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
