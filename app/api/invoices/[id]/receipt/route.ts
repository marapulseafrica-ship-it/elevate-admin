import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invoice, error } = await client
    .from("elevate_invoices")
    .select("*, restaurants(name, email, country)")
    .eq("id", params.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status !== "paid") return NextResponse.json({ error: "Invoice not paid yet" }, { status: 400 });

  const linked = (invoice as any).restaurants;
  const restaurant = linked ?? { name: invoice.client_name ?? "Client", email: invoice.client_email ?? "" };
  const zmwRate = Number(process.env.NEXT_PUBLIC_ZMW_PER_USD ?? 27);

  const pdfBuffer = await renderToBuffer(
    InvoicePDF({ invoice, restaurant, zmwRate, type: "receipt" }) as any
  );

  const receiptNumber = invoice.invoice_number.replace("INV-", "REC-");

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${receiptNumber}.pdf"`,
    },
  });
}
