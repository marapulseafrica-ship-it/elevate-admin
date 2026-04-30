import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";

const TIER_MONTHS: Record<string, number> = { starter: 3, basic: 1, pro: 1, premium: 1 };

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data: payment, error: fetchError } = await supabaseAdmin
    .from("payments")
    .select("*, restaurants(name, email, country)")
    .eq("id", params.id)
    .single();

  if (fetchError || !payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const now = new Date();
  const months = TIER_MONTHS[payment.plan] ?? 1;
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + months);
  const expiryStr = expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const zmwRate = Number(process.env.NEXT_PUBLIC_ZMW_PER_USD ?? 27);
  const restaurant = (payment as any).restaurants;

  // Mark payment completed
  const { error: payErr } = await supabaseAdmin
    .from("payments")
    .update({ status: "completed", completed_at: now.toISOString() })
    .eq("id", params.id);

  if (payErr) return NextResponse.json({ error: payErr.message }, { status: 500 });

  // Upgrade restaurant subscription
  const { error: restErr } = await supabaseAdmin
    .from("restaurants")
    .update({
      subscription_tier: payment.plan,
      subscription_status: "active",
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq("id", payment.restaurant_id);

  if (restErr) return NextResponse.json({ error: restErr.message }, { status: 500 });

  // Auto-mark linked invoice as paid if one exists
  await supabaseAdmin
    .from("elevate_invoices")
    .update({ status: "paid", paid_at: now.toISOString() })
    .eq("payment_id", params.id)
    .neq("status", "paid");

  // Generate receipt PDF from payment data
  const receiptInvoice = {
    invoice_number: `REC-${now.getFullYear()}-${params.id.slice(0, 6).toUpperCase()}`,
    issued_at: now.toISOString(),
    paid_at: now.toISOString(),
    plan: payment.plan,
    amount_usd: Number(payment.amount_usd),
    amount_zmw: Number(payment.amount_zmw) || Number(payment.amount_usd) * zmwRate,
    notes: `Payment reference: ${payment.customer_tx_id ?? payment.flw_tx_ref ?? "N/A"}`,
  };

  let receiptBuffer: Buffer | null = null;
  try {
    const buf = await renderToBuffer(
      InvoicePDF({
        invoice: receiptInvoice,
        restaurant: {
          name: restaurant?.name ?? "Restaurant",
          email: restaurant?.email ?? "",
          country: restaurant?.country ?? null,
        },
        zmwRate,
        type: "receipt",
      }) as any
    );
    receiptBuffer = Buffer.from(buf);
  } catch (e) {
    console.error("Receipt PDF generation error:", e);
  }

  // Email restaurant owner with receipt attached
  if (restaurant?.email) {
    const planLabel = payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1);
    const zmwAmount = receiptInvoice.amount_zmw.toFixed(0);

    const attachments = receiptBuffer
      ? [{ filename: `${receiptInvoice.invoice_number}.pdf`, content: receiptBuffer }]
      : [];

    await sendEmail(
      restaurant.email,
      `Payment confirmed — Your ${planLabel} subscription is now active`,
      `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 16px;">
        <h2 style="color:#1e293b;margin-bottom:4px;">Payment Confirmed ✓</h2>
        <p style="color:#64748b;font-size:14px;margin-bottom:20px;">
          Your payment has been verified and your subscription is now active.
          ${receiptBuffer ? "Please find your receipt attached to this email." : ""}
        </p>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Restaurant</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">${restaurant.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Plan</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;text-transform:capitalize;">${payment.plan}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Amount paid</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">ZMW ${zmwAmount}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Receipt #</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;font-family:monospace;">${receiptInvoice.invoice_number}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Expires</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;">${expiryStr}</td></tr>
        </table>
        <p style="margin-top:24px;font-size:13px;color:#64748b;">
          Log in to your dashboard to access all features of your ${planLabel} plan.
        </p>
        <p style="font-size:13px;color:#94a3b8;margin-top:16px;">— Elevate CRM Team</p>
      </div>`,
      attachments,
    ).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
