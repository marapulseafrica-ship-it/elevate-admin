"use client";
import { useState } from "react";
import { Eye, Download, Send, CheckCircle, Loader2, Receipt } from "lucide-react";

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
    const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    setLoading(null);
    if (res.ok) window.location.reload();
  }

  async function handlePaid() {
    setLoading("paid");
    const res = await fetch(`/api/invoices/${invoiceId}/paid`, { method: "POST" });
    setLoading(null);
    if (res.ok) window.location.reload();
  }

  return (
    <div className="flex items-center gap-1">
      {/* View / Download — always available */}
      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"
        title="Preview invoice PDF"
      >
        <Eye className="w-4 h-4" />
      </a>
      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        download={`${invoiceNumber}.pdf`}
        className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"
        title="Download invoice PDF"
      >
        <Download className="w-4 h-4" />
      </a>

      {/* Send — only if not paid */}
      {status !== "paid" && (
        <button
          onClick={handleSend}
          disabled={!!loading}
          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Send invoice to restaurant"
        >
          {loading === "send" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      )}

      {/* Mark paid — only if not paid */}
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

      {/* Receipt — only once paid */}
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
