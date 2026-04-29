"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Download, Send, CheckCircle, Loader2 } from "lucide-react";

export function InvoiceActions({ invoiceId, invoiceNumber, status }: { invoiceId: string; invoiceNumber: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSend() {
    setLoading("send");
    await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  async function handlePaid() {
    setLoading("paid");
    await fetch(`/api/invoices/${invoiceId}/paid`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"
        title="Preview PDF"
      >
        <Eye className="w-4 h-4" />
      </a>
      <a
        href={`/api/invoices/${invoiceId}/pdf`}
        download={`${invoiceNumber}.pdf`}
        className="p-1.5 text-slate-400 hover:text-purple-600 transition-colors"
        title="Download PDF"
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
    </div>
  );
}
