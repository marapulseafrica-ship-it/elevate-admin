export const dynamic = "force-dynamic";

const resources = [
  {
    category: "Sales Scripts",
    items: [
      { title: "Cold Call Script", desc: "Opening lines, platform explanation, objection handling for a cold call." },
      { title: "WhatsApp Message Templates", desc: "Copy-paste templates for first contact, follow-up, and free trial offer." },
      { title: "Objection Handling Guide", desc: "How to respond to common objections: price, time, not interested." },
    ],
  },
  {
    category: "Platform Knowledge",
    items: [
      { title: "ElevateAI Pricing Sheet", desc: "Current subscription tiers and pricing. Always quote from this sheet." },
      { title: "Feature Overview", desc: "What restaurants get: WhatsApp campaigns, QR check-ins, analytics, CRM." },
      { title: "Restaurant Partner Agreement Summary", desc: "Key terms a restaurant owner needs to know before signing up." },
    ],
  },
  {
    category: "Qualification Checklist",
    items: [
      { title: "Qualified Call Checklist", desc: "A call counts as qualified when: restaurant is on your confirmed list, a decision-maker was contacted, the platform was explained, the free trial was offered, and contact details + outcome were recorded within 24 hours." },
      { title: "Decision Maker Guide", desc: "Who to speak to: Owner, General Manager, Operations Manager. Not waitstaff." },
    ],
  },
  {
    category: "Your Agreement",
    items: [
      { title: "Activity Fee", desc: "K250/month for 25+ qualified calls. K10 per call if under 25." },
      { title: "Conversion Bonus", desc: "K1,000 per restaurant that activates after the free trial (paid once ElevateAI receives the Activation Fee)." },
      { title: "Performance Commission", desc: "10% of the monthly Performance Fee actually received from your restaurants, for the first 5 paid months per restaurant." },
      { title: "Payment Schedule", desc: "Statement sent by the 5th of each month. Payment made by the 10th via Airtel Money, MTN MoMo, or bank transfer." },
      { title: "Monthly List Rules", desc: "Up to 25 restaurants per month. First-submitted wins — if another agent claimed a restaurant first, you cannot submit it. No duplicates across agents." },
    ],
  },
];

export default function AgentResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Resources & Sales Kit</h1>
        <p className="text-sm text-slate-500">Everything you need to sell ElevateAI effectively</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Important:</strong> Always use ElevateAI's approved materials and pricing when speaking to restaurants. Quoting incorrect pricing or making promises not covered in the agreement can result in termination of your contract.
      </div>

      {resources.map(section => (
        <div key={section.category} className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-4 border-b bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">{section.category}</h2>
          </div>
          <div className="divide-y">
            {section.items.map(item => (
              <div key={item.title} className="px-5 py-4">
                <div className="text-sm font-semibold text-slate-800">{item.title}</div>
                <div className="text-sm text-slate-600 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-slate-50 rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">Need Updated Materials?</h2>
        <p className="text-sm text-slate-600">Contact ElevateAI via WhatsApp or email to request the latest sales deck, pricing updates, or demo access. Do not create your own materials without approval.</p>
      </div>
    </div>
  );
}
