import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 11, color: "#1e293b", padding: 48 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#7c3aed" },
  brandSub: { fontSize: 9, color: "#94a3b8", marginTop: 2 },
  invoiceMeta: { textAlign: "right" },
  metaLabel: { fontSize: 9, color: "#94a3b8" },
  metaValue: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 9, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8, letterSpacing: 1 },
  billTo: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  billEmail: { fontSize: 10, color: "#64748b" },
  table: { marginTop: 24, marginBottom: 24 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f8fafc", padding: "8 12", borderRadius: 4 },
  tableRow: { flexDirection: "row", padding: "10 12", borderBottom: "1 solid #f1f5f9" },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "right" },
  headerText: { fontSize: 9, color: "#94a3b8", fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  divider: { borderBottom: "1 solid #e2e8f0", marginVertical: 8 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalLabel: { fontSize: 12, color: "#64748b", marginRight: 24 },
  totalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#7c3aed" },
  footer: { marginTop: 48, padding: "16 20", backgroundColor: "#faf5ff", borderRadius: 8 },
  footerTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#7c3aed", marginBottom: 6 },
  footerText: { fontSize: 9, color: "#64748b", lineHeight: 1.6 },
  thankYou: { textAlign: "center", marginTop: 40, fontSize: 10, color: "#94a3b8" },
});

interface InvoicePDFProps {
  invoice: {
    invoice_number: string;
    issued_at: string;
    due_at?: string | null;
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
}

export function InvoicePDF({ invoice, restaurant, zmwRate = 27 }: InvoicePDFProps) {
  const zmw = invoice.amount_zmw ?? invoice.amount_usd * zmwRate;
  const issuedDate = new Date(invoice.issued_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const dueDate = invoice.due_at
    ? new Date(invoice.due_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "Upon receipt";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Elevate CRM</Text>
            <Text style={styles.brandSub}>Restaurant Marketing Platform</Text>
          </View>
          <View style={styles.invoiceMeta}>
            <Text style={styles.metaLabel}>INVOICE</Text>
            <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
            <Text style={[styles.metaLabel, { marginTop: 8 }]}>Issued</Text>
            <Text style={{ fontSize: 10, marginTop: 2 }}>{issuedDate}</Text>
            <Text style={[styles.metaLabel, { marginTop: 6 }]}>Due</Text>
            <Text style={{ fontSize: 10, marginTop: 2 }}>{dueDate}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.billTo}>{restaurant.name}</Text>
          <Text style={styles.billEmail}>{restaurant.email}</Text>
          {restaurant.country && <Text style={[styles.billEmail, { marginTop: 2 }]}>{restaurant.country}</Text>}
        </View>

        {/* Line items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.col1]}>Description</Text>
            <Text style={[styles.headerText, styles.col2]}>USD</Text>
            <Text style={[styles.headerText, styles.col3]}>ZMW</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.col1, { fontSize: 11 }]}>
              {invoice.plan.charAt(0).toUpperCase() + invoice.plan.slice(1)} Plan — Monthly Subscription
            </Text>
            <Text style={[styles.col2, { fontSize: 11 }]}>${invoice.amount_usd.toFixed(2)}</Text>
            <Text style={[styles.col3, { fontSize: 11 }]}>ZMW {zmw.toFixed(0)}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalValue}>ZMW {zmw.toFixed(0)}</Text>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 10, color: "#64748b" }}>{invoice.notes}</Text>
          </View>
        )}

        {/* Payment instructions */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Payment Instructions</Text>
          <Text style={styles.footerText}>
            Please send payment via Airtel Money to: +260 978 350 824{"\n"}
            Use your company name or invoice number as the reference.{"\n"}
            After payment, send your transaction ID to: elevatalsolutionsagency@gmail.com
          </Text>
        </View>

        <Text style={styles.thankYou}>Thank you for your business — Elevate CRM</Text>
      </Page>
    </Document>
  );
}
