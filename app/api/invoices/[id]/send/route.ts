import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";
import { sendEmail } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
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

  const restaurant = (invoice as any).restaurants;
  const zmwRate = Number(process.env.NEXT_PUBLIC_ZMW_PER_USD ?? 27);
  const zmw = invoice.amount_zmw ?? invoice.amount_usd * zmwRate;

  const pdfBuffer = await renderToBuffer(InvoicePDF({ invoice, restaurant, zmwRate }) as any);

  await sendEmail(
    restaurant.email,
    `Invoice ${invoice.invoice_number} from Elevate CRM`,
    `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 16px;">
      <h2 style="color:#1e293b;margin-bottom:4px;">Invoice from Elevate CRM</h2>
      <p style="color:#64748b;font-size:14px;margin-bottom:20px;">Please find your invoice attached.</p>
      <table style="width:100%;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Invoice #</td>
            <td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;font-family:monospace;">${invoice.invoice_number}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Plan</td>
            <td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;text-transform:capitalize;">${invoice.plan}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Amount due</td>
            <td style="padding:8px 0;font-weight:600;text-align:right;">ZMW ${Number(zmw).toFixed(0)}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#64748b;">
        To pay, send via Airtel Money to <strong>+260 978 350 824</strong> and reply with your transaction ID.
      </p>
      <p style="font-size:13px;color:#94a3b8;margin-top:16px;">— Elevate CRM Team</p>
    </div>`,
    [{ filename: `${invoice.invoice_number}.pdf`, content: Buffer.from(pdfBuffer) }],
  );

  await client
    .from("elevate_invoices")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json({ success: true });
}
