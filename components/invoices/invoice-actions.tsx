"use client";
import { useState } from "react";
import { Eye, Download, Send, CheckCircle, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";

export function InvoiceActions({
  invoiceId,
  invoiceNumber,
  status,
}: {
  invoiceId: string;
  invoiceNumber: string;
  status: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const receiptNumber = invoiceNumber.replace("INV-", "REC-");

  async function handleSend() {
    setLoading("send");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
      if (res.ok) {
        toast.success("Invoice sent to restaurant");
        window.location.reload();
      } else {
        const j = await res.json();
        toast.error(j.error ?? "Failed to send invoice");
      }
    } catch {
      toast.error("Network error — please try again");
    }
    setLoading(null);
  }

  async function handlePaid() {
    setLoading("paid");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/paid`, { method: "POST" });
      if (res.ok) {
        toast.success("Invoice marked as paid");
        window.location.reload();
      } else {
        const j = await res.json();
        toast.error(j.error ?? "Failed to mark as paid");
      }
    } catch {
      toast.error("Network error — please try again");
    }
    setLoading(null);
  }

  return (
    <div className="flex items-center gap-1">
      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"
        title="Preview invoice"
      >
        <Eye className="w-4 h-4" />
      </a>
      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        download={`${invoiceNumber}.pdf`}
        className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"
        title="Download invoice"
      >
        <Download className="w-4 h-4" />
      </a>

      {status !== "paid" && (
        <button
          onClick={handleSend}
          disabled={!!loading}
          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Send to restaurant"
        >
          {loading === "send" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      )}

      {status !== "paid" && (
        <button
          onClick={handlePaid}
          disabled={!!loading}
          className="p-1.5 text-slate-400 hover:text-green-600 transition-colors disabled:opacity-50"
          title="Mark as paid"
        >
          {loading === "paid" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        </button>
      )}

      {status === "paid" && (
        <>
          <a
            href={`/api/invoices/${invoiceId}/receipt`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-green-600 transition-colors"
            title="View receipt"
          >
            <Receipt className="w-4 h-4" />
          </a>
          <a
            href={`/api/invoices/${invoiceId}/receipt`}
            download={`${receiptNumber}.pdf`}
            className="p-1.5 text-slate-400 hover:text-green-600 transition-colors"
            title="Download receipt"
          >
            <Download className="w-4 h-4" />
          </a>
        </>
      )}
    </div>
  );
}
