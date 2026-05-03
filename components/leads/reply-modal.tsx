"use client";
import { useState, useTransition } from "react";
import { replyToLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

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
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1.5">
        <Send className="w-3.5 h-3.5" /> Reply
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply to {name}</DialogTitle>
            <p className="text-sm text-slate-500">{email}</p>
          </DialogHeader>

          {originalMessage && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-500 italic max-h-28 overflow-y-auto">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Their message</p>
              {originalMessage}
            </div>
          )}

          <Textarea
            placeholder="Type your reply..."
            rows={6}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="resize-none"
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">⚠ {error}</p>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isPending || !reply.trim()} className="gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
