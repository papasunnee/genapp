import Link from "next/link";

type Section = {
  id: string;
  icon: string;
  title: string;
  access?: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    icon: "fa-door-open",
    title: "Getting Started",
    body: (
      <>
        <p>
          LabSuite is multi-tenant: every organization gets its own private address, like{" "}
          <span className="font-mono">yourlab.thelabsuite.com</span>, and its own isolated
          database - nothing is ever shared between labs. You always sign in at your
          organization&apos;s own address, not at the main thelabsuite.com site.
        </p>
        <p>
          When you sign up, you choose a subdomain and become that organization&apos;s first{" "}
          <strong>Super Admin</strong>. From there, the Super Admin (or an Admin) creates staff
          accounts under <strong>Staff/Users</strong> and assigns each one a role, which controls
          exactly what they can see and do.
        </p>
        <p>
          If you forget which address your lab uses, or a new organization hasn&apos;t become
          reachable yet (new subdomains can take up to 24 hours to propagate), contact{" "}
          <a href="mailto:hello@thelabsuite.com" className="text-brand-600 font-medium">
            hello@thelabsuite.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "roles",
    icon: "fa-user-shield",
    title: "Roles & Permissions",
    access: "Super Admin, Admin",
    body: (
      <>
        <p>
          Every staff account has a role built on one of five standard levels - each level comes
          with a sensible default set of permissions:
        </p>
        <ul>
          <li>
            <strong>Super Admin</strong> - full access to everything, including the activity log.
          </li>
          <li>
            <strong>Admin</strong> - full day-to-day access; only the activity log is
            Super-Admin-only.
          </li>
          <li>
            <strong>Lab Technician</strong> - entering and editing test results, plus the
            clinical modules (results, QC log, maintenance log, appointments).
          </li>
          <li>
            <strong>Accountant</strong> - payments, invoices, and voiding invoices.
          </li>
          <li>
            <strong>Front Desk</strong> - registering patients, booking appointments, and
            managing the referrer directory.
          </li>
        </ul>
        <p>
          Under <strong>Roles</strong>, Pro and Enterprise plans can create custom roles: pick a
          base level, then check extra permissions on top of it. A custom role can only ever{" "}
          <em>add</em> capabilities beyond its base level, never take them away - so the answer to
          &quot;why can this role do X?&quot; is always either &quot;it&apos;s a level default&quot; or
          &quot;someone explicitly granted it.&quot; Free and Starter plans use the fixed standard
          role set.
        </p>
      </>
    ),
  },
  {
    id: "dashboard",
    icon: "fa-tv",
    title: "Dashboard",
    body: (
      <>
        <p>
          The landing page after login. Shows patient, staff, and completed-test counts with
          month-over-month trend arrows, a revenue-vs-tests chart, pending actions (tests awaiting
          payment or awaiting a result), and a feed of recent activity. Chart history depth depends
          on your plan (1 month on Free, up to 12 months on Enterprise).
        </p>
      </>
    ),
  },
  {
    id: "patients",
    icon: "fa-user",
    title: "Patients & Documents",
    body: (
      <>
        <p>
          <strong>Patients</strong> is the registry at the center of the app. Registering a
          patient captures their demographics (name, DOB, gender, contact info) and, optionally,
          a <strong>referring doctor/clinic</strong> and - on Enterprise - a <strong>branch</strong>.
        </p>
        <p>
          Open a patient&apos;s record to see their full profile, test history, and a{" "}
          <strong>Documents</strong> panel where you can attach scanned consent forms, referral
          letters, or other files (images or PDF, up to 10MB, 10 documents per patient). Click a
          document to open it, or remove it with the trash icon.
        </p>
        <p>Free plans are capped at 5 patient records; Starter at 50; Pro and Enterprise are unlimited.</p>
      </>
    ),
  },
  {
    id: "order-test",
    icon: "fa-cart-plus",
    title: "Order Test & Test Catalog",
    access: "Order Test: Super Admin, Admin, Front Desk · Test Catalog: Super Admin, Admin",
    body: (
      <>
        <p>
          <strong>Order Test</strong> starts a new test for an existing patient: pick the patient,
          choose one or more tests from your lab&apos;s catalog, and the system computes the cost
          from the catalog price (never a client-editable amount) and automatically generates an
          invoice.
        </p>
        <p>
          <strong>Test Catalog</strong> is where that pricing lives - categories, test types, and
          parameters (units, reference ranges) unique to your lab. Every new organization starts
          with a default catalog it can then customize; full catalog customization is a Pro/Enterprise
          feature.
        </p>
      </>
    ),
  },
  {
    id: "results",
    icon: "fa-list",
    title: "Results",
    access: "Super Admin, Admin, Lab Technician",
    body: (
      <>
        <p>
          Every test moves through a simple pipeline: <em>Awaiting Payment</em> →{" "}
          <em>Awaiting Result</em> → <em>Test Completed</em> (or <em>Cancelled</em>). Results lists
          tests by status so a lab technician can see at a glance what still needs entering.
          Entering a result records each parameter&apos;s value against its reference range and an
          optional clinical remark - on Pro, a lab scientist can request an AI-drafted remark
          suggestion first, but it&apos;s always shown as a draft that a human must review and
          explicitly approve before it&apos;s saved.
        </p>
        <p>
          A completed test can be printed as a branded report (your lab&apos;s logo, tagline, and
          contact details) from its detail view.
        </p>
      </>
    ),
  },
  {
    id: "appointments",
    icon: "fa-calendar-check",
    title: "Appointments",
    access: "Super Admin, Admin, Lab Technician, Front Desk",
    body: (
      <>
        <p>
          Book sample-collection or consultation slots for a specific date and time. An
          appointment can link to an existing patient (auto-fills their name and phone) or be
          booked for a walk-in who isn&apos;t registered yet.
        </p>
        <p>
          The list shows one day at a time - step through days with the arrows or jump to any date
          - filterable by status (<em>Scheduled</em>, <em>Completed</em>, <em>Cancelled</em>,{" "}
          <em>No-show</em>). Use the row actions menu to update status or delete a booking.
        </p>
      </>
    ),
  },
  {
    id: "referrers",
    icon: "fa-user-md",
    title: "Referring Doctors/Clinics",
    access: "Super Admin, Admin, Front Desk",
    body: (
      <>
        <p>
          A directory of the physicians and partner clinics who refer patients to your lab. Add a
          referrer&apos;s name, type (Doctor or Clinic), and contact details, then select them when
          registering a patient. The directory shows a live count of patients referred by each
          entry, so you can see referral volume by source for relationship management and billing
          reconciliation with partners.
        </p>
      </>
    ),
  },
  {
    id: "qc-log",
    icon: "fa-vial",
    title: "QC Log",
    access: "Log entries: Super Admin, Admin, Lab Technician · Delete: Super Admin, Admin",
    body: (
      <>
        <p>
          Daily quality-control entries per analyzer: which instrument, which test/parameter,
          control level, expected range, observed value, and a Pass/Fail result. A Fail entry has
          a corrective-action field to record what was done in response. Filter by analyzer or
          status to review history - this is the compliance record most labs are required to keep
          on file, now digital instead of paper.
        </p>
      </>
    ),
  },
  {
    id: "maintenance-log",
    icon: "fa-tools",
    title: "Maintenance Log",
    access: "Log entries: Super Admin, Admin, Lab Technician · Delete: Super Admin, Admin",
    body: (
      <>
        <p>
          A calibration/maintenance/repair history per analyzer - what type of work was done, a
          description, and an optional next-due date so upcoming calibrations don&apos;t get
          missed. Filter by analyzer or entry type to review an instrument&apos;s full service
          history.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    icon: "fa-fingerprint",
    title: "Payments",
    access: "Super Admin, Admin, Accountant",
    body: (
      <>
        <p>
          Record a payment against a test&apos;s invoice (cash or card), which moves that test from
          <em> Awaiting Payment</em> to <em>Awaiting Result</em>. Every payment is tied to the
          staff member who recorded it and to the invoice it settles, so the money trail is always
          traceable back to a specific test and patient.
        </p>
      </>
    ),
  },
  {
    id: "invoices",
    icon: "fa-file-invoice-dollar",
    title: "Invoices",
    access: "Super Admin, Admin, Accountant",
    body: (
      <>
        <p>
          One invoice is generated automatically per test the moment it&apos;s ordered - staff
          never create invoices by hand. Filter by status (<em>Unpaid</em>, <em>Paid</em>,{" "}
          <em>Void</em>), search by invoice number, patient, or test, and print any invoice for a
          patient. A mistaken invoice can be voided (with a reason) rather than deleted, keeping
          the billing history intact.
        </p>
      </>
    ),
  },
  {
    id: "reports",
    icon: "fa-chart-bar",
    title: "Reports",
    access: "Super Admin, Admin, Accountant",
    body: (
      <>
        <p>
          A monthly summary of revenue and completed test volume, broken down by test type. Pick a
          month, review the totals and the breakdown table, then <strong>Download CSV</strong> for
          a spreadsheet or <strong>Print / Save PDF</strong> for a branded printable copy - useful
          for accounting or regulatory submissions.
        </p>
        <p>
          How far back you can go depends on your plan: current month on Free, 3 months on
          Starter, 6 on Pro, 12 on Enterprise.
        </p>
      </>
    ),
  },
  {
    id: "staff-users",
    icon: "fa-users",
    title: "Staff/Users",
    access: "Super Admin, Admin, Front Desk (view)",
    body: (
      <>
        <p>
          Add staff accounts, assign a role, and manage them from the row actions menu:{" "}
          <strong>reset password</strong>, <strong>suspend</strong> (blocks sign-in without
          deleting the account), or remove entirely. You can only assign a role at or below your
          own level - a staff member can never create an account with more authority than their
          own.
        </p>
        <p>
          Staff-account limits by plan: 1 on Free, 3 on Starter, unlimited on Pro/Enterprise.
        </p>
      </>
    ),
  },
  {
    id: "branches",
    icon: "fa-code-branch",
    title: "Branches",
    access: "Super Admin, Admin · Enterprise plan",
    body: (
      <>
        <p>
          For a lab network with more than one physical location sharing a single patient
          registry. Add each location as a branch (name, address, phone), then assign a branch to
          a patient at registration so you can see which location a patient belongs to. This is an
          Enterprise-only feature - other plans see the same page with an upgrade notice instead
          of the &quot;Add Branch&quot; button.
        </p>
      </>
    ),
  },
  {
    id: "settings",
    icon: "fa-cog",
    title: "Settings & Branding",
    access: "Super Admin, Admin",
    body: (
      <>
        <p>
          Organization-wide configuration: your lab&apos;s name, logo, tagline, address, and
          contact details, which appear on every printed report and invoice. Custom letterhead
          branding requires Starter or higher.
        </p>
      </>
    ),
  },
  {
    id: "activity-log",
    icon: "fa-history",
    title: "Activity Log",
    access: "Super Admin only",
    body: (
      <>
        <p>
          An append-only audit trail of significant actions across the organization - patient
          registrations, document uploads, staff changes, QC/maintenance entries, appointment
          bookings, and more - each stamped with who did it and when, even if that staff
          account is later removed.
        </p>
      </>
    ),
  },
  {
    id: "profile",
    icon: "fa-id-badge",
    title: "My Profile",
    body: (
      <>
        <p>
          Every staff member can update their own contact details, upload an avatar, and change
          their password from <strong>My Profile</strong> - available to every role, regardless of
          level.
        </p>
      </>
    ),
  },
  {
    id: "billing",
    icon: "fa-credit-card",
    title: "Subscription & Billing",
    access: "Super Admin, Admin",
    body: (
      <>
        <p>
          Shows your current plan, renewal date, and payment history, and is where you upgrade,
          downgrade, or renew - handled through Paystack. The Free plan runs for 30 days; after
          that (or if a paid plan lapses without renewal), the portal locks to just this page until
          you upgrade or renew, so your data is paused, never deleted.
        </p>
      </>
    ),
  },
  {
    id: "roadmap",
    icon: "fa-road",
    title: "Coming Soon",
    body: (
      <>
        <p>
          A few modules are flagged in the sidebar with a &quot;Soon&quot; badge - visible so you
          know what&apos;s on the roadmap, but not yet built: <strong>Inventory management</strong>{" "}
          (reagent/consumable stock tracking) and <strong>SMS/WhatsApp alerts</strong> (result-ready
          and payment-reminder notifications to patients).
        </p>
      </>
    ),
  },
  {
    id: "help",
    icon: "fa-life-ring",
    title: "Getting Help",
    body: (
      <>
        <p>
          For anything this manual doesn&apos;t cover, plan changes outside self-serve options, or
          account issues, email{" "}
          <a href="mailto:hello@thelabsuite.com" className="text-brand-600 font-medium">
            hello@thelabsuite.com
          </a>{" "}
          - a real person will help directly.
        </p>
      </>
    ),
  },
];

export default function UserManual() {
  return (
    <div className="bg-white text-slate-800">
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <i className="fas fa-flask text-sm"></i>
            </div>
            <span className="font-bold text-slate-800 tracking-tight">LabSuite</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-6 pt-14 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">User Manual</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Every module in the LabSuite portal, what it&apos;s for, who can access it, and how to
          use it. Last updated: August 4, 2026.
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-6 pb-20 flex flex-col md:flex-row gap-10">
        <aside className="md:w-64 flex-shrink-0">
          <div className="md:sticky md:top-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 px-1">
              Contents
            </p>
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                >
                  <i className={`fas ${s.icon} w-4 text-center text-slate-400 flex-shrink-0`}></i>
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <i className={`fas ${s.icon}`}></i>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
              </div>
              {s.access && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 ml-12">
                  Access: {s.access}
                </p>
              )}
              <div className="ml-12 text-sm text-slate-600 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-3">
                {s.body}
              </div>
            </section>
          ))}
        </main>
      </div>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} LabSuite. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-600 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-slate-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
