import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { format } from "date-fns";
import { AgentProfileForm } from "@/components/agent/agent-profile-form";

export const dynamic = "force-dynamic";

export default async function AgentProfilePage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabaseAdmin.from("sales_agents").select("*").eq("user_id", user.id).single();
  if (!agent) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your personal details and payment method</p>
      </div>

      {/* Status */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-700">Agreement Status</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Joined {format(new Date(agent.created_at), "d MMMM yyyy")}
              {agent.contract_signed_at && ` · Agreement signed ${format(new Date(agent.contract_signed_at), "d MMM yyyy")}`}
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${agent.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
            {agent.is_active ? "🟢 Active" : "🔴 Terminated"}
          </span>
        </div>
      </div>

      <AgentProfileForm agent={agent} />
    </div>
  );
}
