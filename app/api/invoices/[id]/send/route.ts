import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";
import { sendEmail } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data: invoice, error } = await supabaseAdmin
    .from("elevate_invoices")
    .select("*, restaurants(name, email, country)")
    .eq("id", params.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const restaurant = (invoice as any).restaurants;
  const zmwRate = Number(process.env.NEXT_PUBLIC_ZMW_PER_USD ?? 27);
  const zmw = invoice.amount_zmw ?? invoice.amount_usd * zmwRate;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(InvoicePDF({ invoice, restaurant, zmwRate }) as any);

  await sendEmail(
    restaurant.email,
    `Invoice ${invoice.invoice_number} from Elevate CRM`,
    `
      <p>Dear ${restaurant.name},</p>
      <p>Please find attached your invoice <strong>${invoice.invoice_number}</strong> for the <strong>${invoice.plan}</strong> plan.</p>
      <p><strong>Amount due: ZMW ${zmw.toFixed(0)} (USD $${Number(invoice.amount_usd).toFixed(2)})</strong></p>
      <p>To pay, send via Airtel Money to <strong>+260 978 350 824</strong> and reply with your transaction ID.</p>
      <p>Thank you for your business!</p>
      <p>— Elevate CRM Team</p>
    `,
    [{ filename: `${invoice.invoice_number}.pdf`, content: Buffer.from(pdfBuffer) }],
  );

  await supabaseAdmin
    .from("elevate_invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json({ success: true });
}
