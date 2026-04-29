import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data: invoice, error } = await supabaseAdmin
    .from("elevate_invoices")
    .select("*, restaurants(name, email, country)")
    .eq("id", params.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const restaurant = (invoice as any).restaurants;
  const zmwRate = Number(process.env.NEXT_PUBLIC_ZMW_PER_USD ?? 27);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(InvoicePDF({ invoice, restaurant, zmwRate }) as any);

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
