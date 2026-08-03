import PricingSection from "./PricingSection";

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

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-800">
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <i className="fas fa-flask text-sm"></i>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">LabSuite</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#pricing"
              className="text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="/demo"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Try the Demo
            </a>
          </div>
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
          Patients, test orders, results, payments, and branded reports - LabSuite gives every lab
          its own private, isolated workspace with the tools to run day-to-day operations without
          the spreadsheets.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/demo"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-3 transition-colors"
          >
            <i className="fas fa-play text-xs"></i>
            Try the Demo
          </a>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-6 py-3 transition-colors"
          >
            View Pricing
          </a>
          <a
            href="mailto:hello@thelabsuite.com"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-6 py-3 transition-colors"
          >
            Talk to Us
          </a>
        </div>
        <p className="text-xs text-slate-400 mt-4">No signup required - sample data included.</p>
        <p className="text-xs text-slate-400 mt-6">
          Already have a lab account?{" "}
          <span className="text-slate-500">
            Visit your organization&apos;s own address to sign in - e.g.{" "}
            <span className="font-mono">yourlab.thelabsuite.com</span>
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

      <PricingSection />

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} LabSuite. All rights reserved.</span>
          <a href="mailto:hello@thelabsuite.com" className="hover:text-slate-600 transition-colors">
            hello@thelabsuite.com
          </a>
        </div>
      </footer>
    </div>
  );
}
