export const dynamic = 'force-dynamic';

import { supabaseAdmin } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateModal } from "@/components/invoices/generate-modal";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

async function getInvoices() {
  const { data } = await supabaseAdmin
    .from("elevate_invoices")
    .select("*, restaurants(name, email)")
    .order("issued_at", { ascending: false });
  return data ?? [];
}

async function getRestaurantsForModal() {
  const { data } = await supabaseAdmin
    .from("restaurants")
    .select("id, name, email")
    .order("name");
  return data ?? [];
}

const STATUS_VARIANT: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-600",
};

export default async function InvoicesPage() {
  const [invoices, restaurants] = await Promise.all([getInvoices(), getRestaurantsForModal()]);

  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount_usd), 0);
  const totalPending = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.amount_usd), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatCurrency(totalPaid)} collected · {formatCurrency(totalPending)} pending
          </p>
        </div>
        <GenerateModal restaurants={restaurants} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50">
                <th className="text-left font-medium px-5 py-3">Invoice #</th>
                <th className="text-left font-medium px-5 py-3">Restaurant</th>
                <th className="text-left font-medium px-5 py-3">Plan</th>
                <th className="text-left font-medium px-5 py-3">Amount</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Issued</th>
                <th className="text-left font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const rest = (inv as any).restaurants;
                return (
                  <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-mono text-purple-700 font-semibold">{inv.invoice_number}</td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-medium text-slate-800">{rest?.name}</div>
                      <div className="text-xs text-slate-400">{rest?.email}</div>
                    </td>
                    <td className="px-5 py-3 text-sm capitalize text-slate-600">{inv.plan}</td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-semibold text-slate-800">
                        {inv.amount_zmw ? `ZMW ${Number(inv.amount_zmw).toFixed(0)}` : formatCurrency(inv.amount_usd)}
                      </div>
                      {inv.amount_zmw && (
                        <div className="text-xs text-slate-400">{formatCurrency(inv.amount_usd)}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_VARIANT[inv.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {format(new Date(inv.issued_at), "d MMM yyyy")}
                    </td>
                    <td className="px-5 py-3">
                      <InvoiceActions invoiceId={inv.id} invoiceNumber={inv.invoice_number} status={inv.status} />
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No invoices yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
