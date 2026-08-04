import type { Metadata } from "next";
import LegalPageShell from "@/components/Marketing/LegalPageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the LabSuite team.",
};

export default function ContactPage() {
  return (
    <LegalPageShell title="Contact Us" updated="August 4, 2026">
      <section>
        <p>
          Whether you&apos;re evaluating LabSuite for your lab, have a question about your
          existing organization&apos;s account, or ran into an issue, we&apos;re glad to help.
        </p>
      </section>

      <section>
        <h2>Email</h2>
        <p>
          The fastest way to reach us for anything - sales questions, billing, technical support,
          or account changes:
        </p>
        <p>
          <a
            href="mailto:hello@thelabsuite.com"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors no-underline"
          >
            <i className="fas fa-envelope"></i>
            hello@thelabsuite.com
          </a>
        </p>
      </section>

      <section>
        <h2>Before you write in</h2>
        <ul>
          <li>
            Check the{" "}
            <a href="/#pricing" className="text-brand-600 underline">
              pricing page
            </a>{" "}
            for plan details, and the FAQ on the home page for common questions about trials,
            billing, and your workspace address.
          </li>
          <li>
            Not sure what LabSuite can do yet? Try the{" "}
            <a href="/demo" className="text-brand-600 underline">
              public demo
            </a>{" "}
            - no signup required.
          </li>
          <li>
            If you&apos;re reporting an issue with your own organization&apos;s account, include
            your organization&apos;s subdomain (e.g. yourlab) so we can look into it quickly.
          </li>
        </ul>
      </section>

      <section>
        <h2>Response time</h2>
        <p>
          We aim to respond to every message within one business day. Urgent account-access
          issues are prioritized.
        </p>
      </section>
    </LegalPageShell>
  );
}
