import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      const { count: initial } = await supabaseAdmin
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      let lastCount = initial ?? 0;
      send({ count: lastCount });

      const interval = setInterval(async () => {
        if (req.signal.aborted) {
          clearInterval(interval);
          try { controller.close(); } catch {}
          return;
        }
        try {
          const { count } = await supabaseAdmin
            .from("payments")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending");

          const newCount = count ?? 0;
          if (newCount !== lastCount) {
            lastCount = newCount;
            send({ count: newCount });
          }
        } catch {}
      }, 3000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
