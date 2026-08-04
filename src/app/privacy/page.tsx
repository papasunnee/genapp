import type { Metadata } from "next";
import LegalPageShell from "@/components/Marketing/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How LabSuite collects, uses, and protects data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="August 4, 2026">
      <section>
        <h2>1. Scope</h2>
        <p>
          This Privacy Policy describes how LabSuite (&quot;we&quot;, &quot;us&quot;) handles
          data in connection with the LabSuite platform - both data about the organizations and
          staff who use LabSuite directly (&quot;Customers&quot;), and the patient data
          Customers store within their own private workspace (&quot;Customer Data&quot;).
        </p>
      </section>

      <section>
        <h2>2. Data isolation between organizations</h2>
        <p>
          Every organization on LabSuite is provisioned its own separate database. Patients,
          tests, payments, and staff accounts belonging to one organization are never stored
          alongside, or queryable from, another organization&apos;s data. Each organization
          reaches its workspace through its own private address (e.g.
          yourlab.thelabsuite.com).
        </p>
      </section>

      <section>
        <h2>3. What we collect</h2>
        <p>Depending on how the Service is used, this includes:</p>
        <ul>
          <li>
            <strong>Account data:</strong> staff name, email, phone, role, and a securely hashed
            password (we never store passwords in plain text).
          </li>
          <li>
            <strong>Organization data:</strong> organization name, subdomain, plan, subscription
            status, and branding details (logo, tagline, contact info) an admin chooses to add.
          </li>
          <li>
            <strong>Customer Data entered by an organization:</strong> patient demographics, test
            orders, results, clinical remarks, payments, and invoices - entered and controlled by
            that organization, not by us.
          </li>
          <li>
            <strong>Billing data:</strong> subscription plan, billing cycle, and payment
            confirmation records. Card details are handled entirely by Paystack, our payment
            processor - we never receive or store full card numbers.
          </li>
          <li>
            <strong>Activity logs:</strong> a record of significant actions (logins, records
            created/changed, invoices voided, etc.) within each organization, visible to that
            organization&apos;s own admins.
          </li>
          <li>
            <strong>Technical data:</strong> IP address and basic request metadata, used for
            security purposes such as rate-limiting repeated failed sign-in attempts.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. How we use data</h2>
        <ul>
          <li>To operate, maintain, and secure the Service.</li>
          <li>To authenticate sign-ins and enforce that each session only reaches its own organization&apos;s data.</li>
          <li>To process subscription payments and renewals through Paystack.</li>
          <li>To provide optional AI-assisted remark suggestions (see below).</li>
          <li>To respond to support requests sent to us directly.</li>
          <li>To detect and throttle abusive or malicious request patterns (e.g. repeated failed logins).</li>
        </ul>
        <p>We do not sell Customer Data or patient data to third parties.</p>
      </section>

      <section>
        <h2>5. Third-party processors</h2>
        <p>We rely on the following third-party services to operate LabSuite:</p>
        <ul>
          <li>
            <strong>MongoDB Atlas</strong> - hosts every organization&apos;s database.
          </li>
          <li>
            <strong>Paystack</strong> - processes subscription payments; card details never
            reach our own servers.
          </li>
          <li>
            <strong>Cloudinary</strong> - stores uploaded logo and profile images.
          </li>
          <li>
            <strong>Anthropic (Claude)</strong> - powers the optional AI-assisted clinical remark
            suggestion feature, where enabled. Only the specific test result data needed to
            generate a suggestion is sent; nothing is sent unless a lab user explicitly requests
            a suggestion, and the AI is never given identifying patient information beyond what
            the requesting organization includes in the result itself.
          </li>
          <li>
            <strong>Vercel</strong> - hosts the application.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. The public demo</h2>
        <p>
          Data entered into the public demo sandbox is not private, is periodically wiped, and
          should never include real patient information.
        </p>
      </section>

      <section>
        <h2>7. Data retention and deletion</h2>
        <p>
          Customer Data is retained for as long as the organization&apos;s account is active. If
          a platform administrator deletes an organization, every record in that organization&apos;s
          database - patients, tests, payments, staff accounts - is permanently removed; this
          action cannot be undone.
        </p>
      </section>

      <section>
        <h2>8. Cookies and sessions</h2>
        <p>
          We use a single, essential session cookie to keep you signed in. We do not use
          third-party advertising or tracking cookies.
        </p>
      </section>

      <section>
        <h2>9. Your rights</h2>
        <p>
          If you are a patient whose data is held by a LabSuite Customer (a lab), requests about
          your data should go to that lab directly, as they control their own records. If you are
          a Customer with questions about your organization&apos;s account data, or believe we
          hold data about you that needs to be corrected or removed, contact us at{" "}
          <a href="mailto:hello@thelabsuite.com" className="text-brand-600 underline">
            hello@thelabsuite.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>10. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected
          by an updated date at the top of this page.
        </p>
      </section>

      <section>
        <h2>11. Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          <a href="mailto:hello@thelabsuite.com" className="text-brand-600 underline">
            hello@thelabsuite.com
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
