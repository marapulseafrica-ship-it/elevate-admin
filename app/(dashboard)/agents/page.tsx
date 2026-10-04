export const dynamic = "force-dynamic";

import { getAllAgents, getAgentsOverview, getAllAgentLeads, getAllAgentConversions, getAllAgentPayouts, getAgentStats } from "@/lib/queries/agents";
import { Card } from "@/components/ui/card";
import { AgentsTable } from "@/components/agents/agents-table";
import { AgentLeadsTable } from "@/components/agents/agent-leads-table";
import { AgentConversionsTable } from "@/components/agents/agent-conversions-table";
import { AgentPayoutsTable } from "@/components/agents/agent-payouts-table";
import { Users, Phone, Award, DollarSign } from "lucide-react";

export default async function AgentsPage() {
  const [stats, agents, overview, leads, conversions, payouts] = await Promise.all([
    getAgentStats(),
    getAllAgents(),
    getAgentsOverview(),
    getAllAgentLeads(),
    getAllAgentConversions(),
    getAllAgentPayouts(),
  ]);

  const signupUrl = `${process.env.NEXT_PUBLIC_CRM_URL ?? "https://elevate-crm.vercel.app"}/agent-signup`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales Agents</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {stats.active_agents} active · {stats.month_leads} restaurants listed this month · {stats.month_calls} qualified calls
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">Agent signup link</div>
          <code className="text-xs bg-slate-100 border rounded px-2 py-1 text-slate-700 font-mono select-all">
            {signupUrl}
          </code>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-slate-500">Active Agents</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.active_agents}</div>
          <div className="text-xs text-slate-400 mt-1">{stats.total_agents} total</div>
        </Card>
        <Card className="p-4 bg-white">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-slate-500">Calls This Month</span>
            <Phone className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.month_calls}</div>
          <div className="text-xs text-slate-400 mt-1">{stats.month_leads} restaurants listed</div>
        </Card>
        <Card className="p-4 bg-white">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-slate-500">Total Activations</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.total_conversions}</div>
          <div className="text-xs text-slate-400 mt-1">restaurants that paid</div>
        </Card>
        <Card className="p-4 bg-white">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-slate-500">Unpaid to Agents</span>
            <DollarSign className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-600">K{stats.unpaid_total.toFixed(0)}</div>
          <div className="text-xs text-slate-400 mt-1">due by 10th of month</div>
        </Card>
      </div>

      {/* Agent overview */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Agents</h2>
          <p className="text-xs text-slate-400 mt-0.5">Agents sign up via the link above — they appear here automatically</p>
        </div>
        <AgentsTable overview={overview} agents={agents} />
      </Card>

      {/* Payouts */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Payouts</h2>
            <p className="text-xs text-slate-400 mt-0.5">Pay by the 10th of each month · statement sent by the 5th</p>
          </div>
        </div>
        <AgentPayoutsTable payouts={payouts} />
      </Card>

      {/* Conversions */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Conversions & Commission</h2>
          <p className="text-xs text-slate-400 mt-0.5">Free trial → activation (K1,000 bonus) → 5 paid months (10% commission each)</p>
        </div>
        <AgentConversionsTable conversions={conversions} />
      </Card>

      {/* All leads */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">All Restaurant Leads</h2>
          <p className="text-xs text-slate-400 mt-0.5">Every restaurant across all agents</p>
        </div>
        <AgentLeadsTable leads={leads} />
      </Card>
    </div>
  );
}
