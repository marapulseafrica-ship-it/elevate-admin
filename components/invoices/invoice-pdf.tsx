import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Brand colours extracted from logo
const NAVY = "#1a2d5f";
const PERIWINKLE = "#b0b8e8";
const WHITE = "#ffffff";
const MUTED = "#64748b";
const LIGHT = "#f4f6fb";
const GREEN = "#16a34a";
const GREEN_BG = "#f0fdf4";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#1e293b", backgroundColor: WHITE },

  // ── Header band ──────────────────────────────────────────────
  header: {
    backgroundColor: NAVY,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 24,
  },

  // Logo area
  logoRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 3, marginRight: 8, marginBottom: 2 },
  bar1: { width: 5, height: 8,  backgroundColor: PERIWINKLE, borderRadius: 1 },
  bar2: { width: 5, height: 13, backgroundColor: PERIWINKLE, borderRadius: 1 },
  bar3: { width: 5, height: 19, backgroundColor: WHITE,      borderRadius: 1 },
  brandName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: WHITE, letterSpacing: 0.5 },
  brandSub:  { fontSize: 7,  color: PERIWINKLE, letterSpacing: 2, marginTop: 3, textTransform: "uppercase" },

  // Doc type badge (right side of header)
  docBadge: { alignItems: "flex-end" },
  docType:   { fontSize: 22, fontFamily: "Helvetica-Bold", color: WHITE, letterSpacing: 3 },
  docNumber: { fontSize: 11, color: PERIWINKLE, marginTop: 4, fontFamily: "Helvetica-Bold" },

  // ── Body ─────────────────────────────────────────────────────
  body: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 40 },

  // From + meta row
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  fromBlock: { flex: 1 },
  metaBlock: { alignItems: "flex-end" },

  sectionLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: PERIWINKLE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 },
  companyName:  { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 3 },
  bodyText:     { fontSize: 9, color: MUTED, lineHeight: 1.6 },

  metaLine: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 },
  metaKey:  { fontSize: 9, color: MUTED, marginRight: 8 },
  metaVal:  { fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY, minWidth: 90, textAlign: "right" },

  // Divider
  divider: { borderBottom: `1 solid ${PERIWINKLE}`, marginBottom: 22, opacity: 0.4 },

  // Bill To
  billSection: { backgroundColor: LIGHT, borderRadius: 6, padding: "12 16", marginBottom: 24 },
  billName:    { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  billDetail:  { fontSize: 9, color: MUTED, lineHeight: 1.6 },

  // Table
  table: { marginBottom: 20 },
  tableHead: { flexDirection: "row", backgroundColor: NAVY, borderRadius: 4, padding: "8 12", marginBottom: 2 },
  tableRow:  { flexDirection: "row", padding: "9 12", borderBottom: `1 solid ${LIGHT}` },
  tableRowAlt: { flexDirection: "row", padding: "9 12", borderBottom: `1 solid ${LIGHT}`, backgroundColor: LIGHT },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: WHITE, textTransform: "uppercase", letterSpacing: 1 },
  tdText: { fontSize: 9, color: "#1e293b" },
  tdMuted:{ fontSize: 8, color: MUTED, marginTop: 1 },

  colDesc: { flex: 4 },
  colQty:  { flex: 1, textAlign: "center" },
  colRate: { flex: 2, textAlign: "right" },
  colAmt:  { flex: 2, textAlign: "right" },

  // Totals
  totalsBlock: { alignItems: "flex-end", marginBottom: 28 },
  totalRow:   { flexDirection: "row", justifyContent: "flex-end", marginBottom: 5 },
  totalLabel: { fontSize: 9, color: MUTED, width: 90, textAlign: "right", marginRight: 20 },
  totalValue: { fontSize: 9, color: "#1e293b", width: 80, textAlign: "right" },
  grandRow:   { flexDirection: "row", justifyContent: "flex-end", backgroundColor: NAVY, borderRadius: 4, padding: "8 16", marginTop: 6 },
  grandLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: WHITE, marginRight: 20 },
  grandValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: WHITE },
  zmwLine:    { flexDirection: "row", justifyContent: "flex-end", marginTop: 5 },
  zmwText:    { fontSize: 8, color: MUTED },

  // Paid banner (receipt)
  paidBanner: {
    backgroundColor: GREEN_BG,
    borderRadius: 6,
    padding: "10 16",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    borderLeft: `3 solid ${GREEN}`,
  },
  paidText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: GREEN },
  paidSub:  { fontSize: 9, color: GREEN, marginTop: 2 },

  // Payment instructions box
  payBox: { backgroundColor: LIGHT, borderRadius: 6, padding: "14 16", marginBottom: 20 },
  payTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 },
  payText:  { fontSize: 9, color: MUTED, lineHeight: 1.7 },

  // Footer
  footer: {
    backgroundColor: NAVY,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 14,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: { fontSize: 8, color: PERIWINKLE },
  footerBold: { fontSize: 8, fontFamily: "Helvetica-Bold", color: WHITE },
});

interface InvoicePDFProps {
  invoice: {
    invoice_number: string;
    issued_at: string;
    due_at?: string | null;
    paid_at?: string | null;
    plan: string;
    amount_usd: number;
    amount_zmw?: number | null;
    notes?: string | null;
  };
  restaurant: {
    name: string;
    email: string;
    country?: string | null;
  };
  zmwRate?: number;
  type?: "invoice" | "receipt";
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

const PLAN_DESC: Record<string, string> = {
  starter: "Starter Plan — Monthly Subscription",
  basic:   "Basic Plan — Monthly Subscription",
  pro:     "Pro Plan — Monthly Subscription",
  premium: "Premium Plan — Monthly Subscription",
  setup_fee: "Setup Fee — One-time Onboarding",
};

export function InvoicePDF({ invoice, restaurant, zmwRate = 27, type = "invoice" }: InvoicePDFProps) {
  const isReceipt = type === "receipt";
  const zmw = invoice.amount_zmw ?? invoice.amount_usd * zmwRate;
  const usd = Number(invoice.amount_usd);
  const docNumber = isReceipt ? invoice.invoice_number.replace("INV-", "REC-") : invoice.invoice_number;
  const issuedDate = fmt(invoice.issued_at);
  const dueDate = invoice.due_at ? fmt(invoice.due_at) : "Upon receipt";
  const paidDate = invoice.paid_at ? fmt(invoice.paid_at) : fmt(new Date().toISOString());

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.logoRow}>
            {/* Mini bar-chart icon */}
            <View style={s.bars}>
              <View style={s.bar1} />
              <View style={s.bar2} />
              <View style={s.bar3} />
            </View>
            <View>
              <Text style={s.brandName}>ElevateAI</Text>
              <Text style={s.brandSub}>Solutions Limited</Text>
            </View>
          </View>

          <View style={s.docBadge}>
            <Text style={s.docType}>{isReceipt ? "RECEIPT" : "INVOICE"}</Text>
            <Text style={s.docNumber}>{docNumber}</Text>
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* From + Meta */}
          <View style={s.metaRow}>
            <View style={s.fromBlock}>
              <Text style={s.sectionLabel}>From</Text>
              <Text style={s.companyName}>ElevateAI Solutions Limited</Text>
              <Text style={s.bodyText}>Lusaka, Zambia</Text>
              <Text style={s.bodyText}>support@elevateaisolutionsagency.com</Text>
              <Text style={s.bodyText}>+260 978 350 824</Text>
            </View>

            <View style={s.metaBlock}>
              <Text style={[s.sectionLabel, { textAlign: "right" }]}>Document details</Text>
              <View style={s.metaLine}>
                <Text style={s.metaKey}>Issue Date</Text>
                <Text style={s.metaVal}>{issuedDate}</Text>
              </View>
              {!isReceipt && (
                <View style={s.metaLine}>
                  <Text style={s.metaKey}>Due Date</Text>
                  <Text style={s.metaVal}>{dueDate}</Text>
                </View>
              )}
              {isReceipt && (
                <View style={s.metaLine}>
                  <Text style={s.metaKey}>Paid On</Text>
                  <Text style={s.metaVal}>{paidDate}</Text>
                </View>
              )}
              <View style={s.metaLine}>
                <Text style={s.metaKey}>Status</Text>
                <Text style={[s.metaVal, { color: isReceipt ? GREEN : "#d97706" }]}>
                  {isReceipt ? "PAID" : "PAYMENT DUE"}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.divider} />

          {/* Paid banner on receipt */}
          {isReceipt && (
            <View style={s.paidBanner}>
              <View>
                <Text style={s.paidText}>✓  Payment Received — Thank You!</Text>
                <Text style={s.paidSub}>This receipt confirms your payment has been processed.</Text>
              </View>
            </View>
          )}

          {/* Bill To */}
          <View style={s.billSection}>
            <Text style={s.sectionLabel}>{isReceipt ? "Receipt for" : "Bill to"}</Text>
            <Text style={s.billName}>{restaurant.name}</Text>
            {restaurant.email ? <Text style={s.billDetail}>{restaurant.email}</Text> : null}
            {restaurant.country ? <Text style={s.billDetail}>{restaurant.country}</Text> : null}
          </View>

          {/* Items table */}
          <View style={s.table}>
            <View style={s.tableHead}>
              <Text style={[s.thText, s.colDesc]}>Description</Text>
              <Text style={[s.thText, s.colQty]}>Qty</Text>
              <Text style={[s.thText, s.colRate]}>Unit Price</Text>
              <Text style={[s.thText, s.colAmt]}>Amount</Text>
            </View>
            <View style={s.tableRowAlt}>
              <View style={s.colDesc}>
                <Text style={s.tdText}>{PLAN_DESC[invoice.plan] ?? invoice.plan}</Text>
                {invoice.notes ? <Text style={s.tdMuted}>{invoice.notes}</Text> : null}
              </View>
              <Text style={[s.tdText, s.colQty]}>1</Text>
              <Text style={[s.tdText, s.colRate]}>${usd.toFixed(2)}</Text>
              <Text style={[s.tdText, s.colAmt]}>${usd.toFixed(2)}</Text>
            </View>
          </View>

          {/* Totals */}
          <View style={s.totalsBlock}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>${usd.toFixed(2)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>VAT (0%)</Text>
              <Text style={s.totalValue}>$0.00</Text>
            </View>
            <View style={s.grandRow}>
              <Text style={s.grandLabel}>{isReceipt ? "Amount Paid" : "Total Due"}</Text>
              <Text style={s.grandValue}>${usd.toFixed(2)}</Text>
            </View>
            <View style={s.zmwLine}>
              <Text style={s.zmwText}>Equivalent: ZMW {Number(zmw).toFixed(0)}</Text>
            </View>
          </View>

          {/* Payment instructions (invoice only) */}
          {!isReceipt && (
            <View style={s.payBox}>
              <Text style={s.payTitle}>Payment Instructions</Text>
              <Text style={s.payText}>
                Send payment via Airtel Money to:  +260 978 350 824{"\n"}
                Reference: your invoice number {docNumber}{"\n"}
                After payment, forward your transaction ID to: support@elevateaisolutionsagency.com
              </Text>
            </View>
          )}

          {/* Receipt payment method box */}
          {isReceipt && (
            <View style={s.payBox}>
              <Text style={s.payTitle}>Payment Details</Text>
              <Text style={s.payText}>
                Method: Airtel Money{"\n"}
                Amount paid: ZMW {Number(zmw).toFixed(0)} (USD ${usd.toFixed(2)}){"\n"}
                {invoice.notes ? `Reference: ${invoice.notes}` : ""}
              </Text>
            </View>
          )}

        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ElevateAI Solutions Limited  ·  Lusaka, Zambia</Text>
          <Text style={s.footerBold}>Thank you for your business</Text>
          <Text style={s.footerText}>{docNumber}</Text>
        </View>

      </Page>
    </Document>
  );
}
