"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. The Free plan runs for 30 days with no payment required - enough room to add up to 1 staff account and 5 patient records so you can try real workflows before committing to anything.",
  },
  {
    question: "What happens after the 30-day trial ends?",
    answer:
      "You'll see a countdown in your portal as the trial winds down. Once it expires, sign-in still works but the portal locks to just the Billing page until you upgrade to Starter or Pro - your data is never deleted, just paused.",
  },
  {
    question: "Can I upgrade or renew before my plan expires?",
    answer:
      "Yes, any time. Renewing early extends from your existing renewal date rather than today's date, so you never lose paid time by renewing ahead of schedule.",
  },
  {
    question: "Is my lab's data kept separate from other organizations?",
    answer:
      "Yes. Every organization gets its own isolated database - patients, tests, payments, and staff accounts from one lab are never visible to, or mixed with, another lab's data.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Subscriptions are billed in Naira (₦) through Paystack, which supports cards, bank transfers, and USSD depending on what your bank offers.",
  },
  {
    question: "Can I try LabSuite before creating an account?",
    answer:
      "Yes - the public demo (linked above) is a shared sandbox pre-loaded with sample data. It resets periodically and a few settings are disabled, but every core workflow is there to click through.",
  },
  {
    question: "How do I get my own address, like acmelabs.thelabsuite.com?",
    answer:
      "You choose your subdomain during sign-up, and we check its availability as you type. New addresses can take up to 24 hours to become reachable while DNS finishes propagating.",
  },
  {
    question: "What if I have a problem or need something changed manually?",
    answer:
      "Email hello@thelabsuite.com - for anything self-serve doesn't cover yet (plan changes outside Starter/Pro, Enterprise arrangements, account issues), a real person will help directly.",
  },
  {
    question: "Does LabSuite use AI, and is a diagnosis ever generated automatically?",
    answer:
      "On Pro, a lab scientist can request an AI-drafted clinical remark suggestion based on a test's recorded results. It's always shown as a draft that a human must review, edit, and explicitly approve before it's saved - LabSuite never records or submits an AI-generated remark on its own, and it's never a diagnosis.",
  },
  {
    question: "Where can I read the Terms of Use and Privacy Policy?",
    answer:
      "Both are linked in the footer below - the Privacy Policy covers exactly what data we collect, which third parties (Paystack, Cloudinary, MongoDB Atlas, Anthropic) process it, and how organization data stays isolated.",
  },
  {
    question: "Do appointments, referrer tracking, and compliance logs cost extra?",
    answer:
      "No - appointment scheduling, the referring doctor/clinic directory, patient document uploads, and QC/maintenance compliance logs are included on every plan, including Free.",
  },
  {
    question: "Is there a full guide to every feature?",
    answer:
      "Yes - the User Manual (linked in the footer) walks through every module in the portal, from patient registration to reports, with who can access what and step-by-step instructions.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <p className="text-slate-500 mt-2">Everything else you might be wondering about.</p>
        </div>

        <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-slate-800">{faq.question}</span>
                  <i
                    className={`fas fa-chevron-down text-xs text-slate-400 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>
                {isOpen && (
                  <p className="text-sm text-slate-500 leading-relaxed pb-4 pr-8">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
