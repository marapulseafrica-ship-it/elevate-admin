"use client";
import { useState, useTransition } from "react";
import { replyToLead } from "@/app/actions/leads";
import { Send, Loader2, X } from "lucide-react";

interface ReplyModalProps {
  id: string;
  name: string;
  email: string;
  originalMessage?: string | null;
}

export function ReplyModal({ id, name, email, originalMessage }: ReplyModalProps) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    if (!reply.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await replyToLead(id, reply.trim());
        setOpen(false);
        setReply("");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to send");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
      >
        <Send className="w-3 h-3" /> Reply
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Reply to {name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{email}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Original message */}
              {originalMessage && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-h-28 overflow-y-auto">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Their message</p>
                  <p className="text-sm text-slate-500 italic">{originalMessage}</p>
                </div>
              )}

              {/* Reply textarea */}
              <textarea
                rows={6}
                placeholder="Type your reply..."
                value={reply}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReply(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">⚠ {error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isPending || !reply.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
