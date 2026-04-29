export const dynamic = 'force-dynamic';

import { supabaseAdmin } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { PaymentsTable } from "@/components/payments/payments-table";
import { RecentPaymentsTable } from "@/components/payments/recent-payments-table";
import { Clock, CheckCircle } from "lucide-react";

async function getPayments() {
  const [{ data: pending }, { data: recent }] = await Promise.all([
    supabaseAdmin
      .from("payments")
      .select("*, restaurants(name, email, whatsapp_number)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("payments")
      .select("*, restaurants(name, email)")
      .in("status", ["completed", "failed"])
      .order("completed_at", { ascending: false })
      .limit(20),
  ]);
  return { pending: pending ?? [], recent: recent ?? [] };
}

export default async function PaymentsPage() {
  const { pending, recent } = await getPayments();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review and approve restaurant payment submissions</p>
      </div>

      {/* Pending approvals */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-slate-800">Pending Approvals</h3>
          {pending.length > 0 && (
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pending.length} waiting
            </span>
          )}
        </div>
        <PaymentsTable payments={pending} />
      </Card>

      {/* Recent processed */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <h3 className="font-semibold text-slate-800">Recent Processed</h3>
        </div>
        <RecentPaymentsTable payments={recent} />
      </Card>
    </div>
  );
}
