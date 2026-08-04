import type { Metadata } from "next";
import LegalPageShell from "@/components/Marketing/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing use of LabSuite.",
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Use" updated="August 4, 2026">
      <section>
        <h2>1. Agreement to these terms</h2>
        <p>
          These Terms of Use (&quot;Terms&quot;) govern access to and use of LabSuite, a
          multi-tenant laboratory management platform (&quot;Service&quot;), provided by
          LabSuite (&quot;we&quot;, &quot;us&quot;). By creating an organization, signing in, or
          otherwise using the Service, you agree to these Terms on behalf of yourself and, if
          applicable, the organization you represent (&quot;Customer&quot;).
        </p>
      </section>

      <section>
        <h2>2. What LabSuite is</h2>
        <p>
          LabSuite lets a diagnostic laboratory register patients, order and record tests,
          capture results, track payments and invoices, manage staff accounts and roles, and
          print branded reports, within a private workspace isolated from every other
          organization on the platform.
        </p>
      </section>

      <section>
        <h2>3. Accounts and organizations</h2>
        <ul>
          <li>
            An organization&apos;s Super Admin is responsible for the accuracy of the
            organization&apos;s data and for managing which staff members have access.
          </li>
          <li>
            You are responsible for keeping login credentials confidential and for all activity
            under your account.
          </li>
          <li>
            We may suspend or terminate an organization&apos;s access for violation of these
            Terms, non-payment, or activity we reasonably believe is fraudulent, harmful, or
            illegal.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Plans, billing, and the free trial</h2>
        <ul>
          <li>
            The Free plan is a 30-day trial. After it lapses without upgrading to a paid plan,
            access is limited to the billing page until you upgrade; your data is retained, not
            deleted.
          </li>
          <li>
            Paid plans (Starter, Pro) are billed in Nigerian Naira (₦) through Paystack, on the
            monthly or yearly cycle you select. Renewing before your current period ends extends
            from your existing renewal date.
          </li>
          <li>
            Fees are non-refundable except where required by law or expressly stated otherwise.
          </li>
          <li>
            We may change plan pricing or features going forward; changes won&apos;t apply
            retroactively to an already-paid billing period.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Customer data and patient records</h2>
        <p>
          As between you and us, Customer retains ownership of all patient records, test data,
          and other content entered into the Service (&quot;Customer Data&quot;). We process
          Customer Data solely to provide the Service, as described in our{" "}
          <a href="/privacy" className="text-brand-600 underline">
            Privacy Policy
          </a>
          . Customer is solely responsible for having the legal right to collect and process its
          patients&apos; data, including obtaining any consents required under applicable law,
          and for how it uses the Service in its own clinical or business operations.
        </p>
      </section>

      <section>
        <h2>6. AI-assisted features</h2>
        <p>
          Where enabled for your plan, LabSuite can generate a draft clinical remark suggestion
          from a test&apos;s recorded results using a third-party AI model. Any AI-generated
          draft is clearly marked as such, is never saved unless a human user reviews, edits as
          needed, and explicitly approves it, and is never treated as a diagnosis. Responsibility
          for the accuracy of any remark ultimately recorded rests with the reviewing lab
          professional, not with LabSuite or the AI provider.
        </p>
      </section>

      <section>
        <h2>7. The public demo</h2>
        <p>
          The public demo at /demo is a shared sandbox for evaluation only. Data entered there is
          not private, resets periodically without notice, and must never include real patient
          information.
        </p>
      </section>

      <section>
        <h2>8. Acceptable use</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Violate any applicable law or regulation, including healthcare data protection law.</li>
          <li>Access or attempt to access another organization&apos;s data without authorization.</li>
          <li>Probe, scan, or interfere with the Service&apos;s security or availability.</li>
          <li>Upload malicious code or content you don&apos;t have the right to upload.</li>
        </ul>
      </section>

      <section>
        <h2>9. Availability and support</h2>
        <p>
          We aim for reliable availability but do not guarantee the Service will be
          uninterrupted or error-free. Support requests can be sent to{" "}
          <a href="mailto:hello@thelabsuite.com" className="text-brand-600 underline">
            hello@thelabsuite.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>10. Disclaimer and limitation of liability</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. LabSuite is
          a records and workflow management tool, not a medical device, and is not a substitute
          for professional clinical judgment. To the maximum extent permitted by law, LabSuite
          is not liable for indirect, incidental, or consequential damages arising from use of
          the Service.
        </p>
      </section>

      <section>
        <h2>11. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Material changes will be reflected by an
          updated date at the top of this page. Continued use of the Service after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:hello@thelabsuite.com" className="text-brand-600 underline">
            hello@thelabsuite.com
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
