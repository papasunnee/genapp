const FEATURES = [
  {
    icon: "fa-user-md",
    title: "Patient Records",
    description:
      "Register patients once and keep their full history, demographics, and test history in one place.",
  },
  {
    icon: "fa-vials",
    title: "Test Ordering & Catalog",
    description:
      "A customizable test catalog per lab - set your own units, reference ranges, and pricing for every test you offer.",
  },
  {
    icon: "fa-flask",
    title: "Result Entry & Tracking",
    description:
      "Every test moves through a clear workflow - awaiting payment, awaiting result, completed - so nothing falls through the cracks.",
  },
  {
    icon: "fa-cash-register",
    title: "Payments & Revenue",
    description:
      "Record payments, track invoices, and see revenue broken down by day, status, and test - all in real time.",
  },
  {
    icon: "fa-user-shield",
    title: "Role-Based Staff Access",
    description:
      "Admins, lab technicians, accountants, and front desk staff each see exactly what their role needs - nothing more.",
  },
  {
    icon: "fa-print",
    title: "Branded Lab Reports",
    description:
      "Printable results carry your lab's own letterhead - logo, tagline, and contact details - ready to hand to a patient or doctor.",
  },
  {
    icon: "fa-chart-line",
    title: "Real Dashboards",
    description:
      "A live view of patients, tests, revenue, and month-over-month trends - not a static report you have to go looking for.",
  },
  {
    icon: "fa-palette",
    title: "Your Own Organization",
    description:
      "Every lab runs on its own private address and its own isolated data - your records are never mixed with anyone else's.",
  },
];

const TIERS = [
  {
    name: "Free",
    price: "₦0",
    period: "/month",
    tagline: "For a single lab trying LabFlow out.",
    cta: "Start Free",
    highlighted: false,
    features: [
      "1 organization",
      "Up to 2 staff accounts",
      "Up to 100 patient records",
      "Core patient, test & payment workflow",
      "Basic dashboard",
    ],
  },
  {
    name: "Pro",
    price: "₦25,000",
    period: "/month",
    tagline: "For a growing lab that needs the full toolkit.",
    cta: "Talk to Sales",
    highlighted: true,
    features: [
      "Unlimited staff accounts",
      "Unlimited patient records",
      "Full test catalog customization",
      "Organization branding & letterhead",
      "Revenue analytics & reporting",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For multi-branch labs and networks.",
    cta: "Contact Us",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Multiple branch/organization management",
      "Dedicated onboarding",
      "Custom integrations",
      "SLA-backed support",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-800">
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <i className="fas fa-flask text-sm"></i>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">LabFlow</span>
          </div>
          <a
            href="#pricing"
            className="text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            Pricing
          </a>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-700 bg-brand-50 px-3 py-1 rounded-full mb-6">
          Lab management, done right
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
          Run your diagnostic lab from one place
        </h1>
        <p className="text-lg text-slate-500 mt-5 max-w-2xl mx-auto">
          Patients, test orders, results, payments, and branded reports - LabFlow gives every lab
          its own private, isolated workspace with the tools to run day-to-day operations without
          the spreadsheets.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3 transition-colors"
          >
            View Pricing
            <i className="fas fa-arrow-right text-xs"></i>
          </a>
          <a
            href="mailto:hello@labflow.app"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-6 py-3 transition-colors"
          >
            Talk to Us
          </a>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          Already have a lab account?{" "}
          <span className="text-slate-500">
            Visit your organization&apos;s own address to sign in - e.g.{" "}
            <span className="font-mono">yourlab.labflow.app</span>
          </span>
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Everything your lab needs</h2>
          <p className="text-slate-500 mt-2">One system, built around how a diagnostic lab actually works.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <i className={`fas ${feature.icon}`}></i>
              </div>
              <h3 className="font-semibold text-slate-800">{feature.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Simple, transparent pricing</h2>
            <p className="text-slate-500 mt-2">Pick the tier that fits your lab. Upgrade any time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 bg-white border ${
                  tier.highlighted
                    ? "border-brand-600 shadow-lg ring-1 ring-brand-600 md:-translate-y-2"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                {tier.highlighted && (
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-white bg-brand-600 px-2.5 py-1 rounded-full mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{tier.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{tier.price}</span>
                  {tier.period && <span className="text-sm text-slate-400">{tier.period}</span>}
                </div>
                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <i className="fas fa-check text-emerald-500 mt-0.5 text-xs"></i>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@labflow.app"
                  className={`mt-6 block text-center rounded-lg text-sm font-semibold px-4 py-2.5 transition-colors ${
                    tier.highlighted
                      ? "bg-brand-600 hover:bg-brand-700 text-white"
                      : "border border-slate-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} LabFlow. All rights reserved.</span>
          <a href="mailto:hello@labflow.app" className="hover:text-slate-600 transition-colors">
            hello@labflow.app
          </a>
        </div>
      </footer>
    </div>
  );
}
