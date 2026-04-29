"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { StickyNote, Trash2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";

export function RestaurantNotes({ restaurantId, initialNotes }: { restaurantId: string; initialNotes: any[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function addNote() {
    if (!content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/restaurants/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, content: content.trim() }),
    });
    const newNote = await res.json();
    setNotes((prev) => [newNote, ...prev]);
    setContent("");
    setSaving(false);
  }

  async function deleteNote(id: string) {
    await fetch(`/api/restaurants/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <StickyNote className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-slate-800">Internal Notes</h3>
      </div>
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note (e.g. 'Late payer', 'High churn risk')..."
          rows={2}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        />
        <Button onClick={addNote} loading={saving} size="sm" className="self-end">Save</Button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notes.length === 0 && <p className="text-xs text-slate-400">No notes yet</p>}
        {notes.map((n) => (
          <div key={n.id} className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex justify-between gap-2">
            <div>
              <p className="text-sm text-slate-700">{n.content}</p>
              <p className="text-xs text-slate-400 mt-0.5">{format(new Date(n.created_at), "d MMM yyyy, HH:mm")}</p>
            </div>
            <button onClick={() => deleteNote(n.id)} className="text-slate-300 hover:text-red-400 flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
