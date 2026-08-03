"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/functions";

const PRO_MONTHLY = 35000;

const TIERS = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "For a single lab trying LabSuite out.",
    cta: "Start Free",
    highlighted: false,
    features: [
      "1 organization",
      "Up to 1 staff account",
      "Up to 5 patient records",
      "Core patient, test & payment workflow",
      "Digital invoicing & printable reports",
      "Standard role set (fixed)",
      "Basic dashboard",
    ],
  },
  {
    name: "Pro",
    monthly: PRO_MONTHLY,
    yearly: PRO_MONTHLY * 10, // 2 months free vs. paying monthly
    tagline: "For a growing lab that needs the full toolkit.",
    cta: "Talk to Sales",
    highlighted: true,
    features: [
      "Unlimited staff accounts",
      "Unlimited patient records",
      "Full test catalog customization",
      "Organization branding & letterhead",
      "Custom role management",
      "AI-assisted result interpretation",
      "Revenue analytics & reporting",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    monthly: null,
    yearly: null,
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

export default function PricingSection() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Simple, transparent pricing</h2>
          <p className="text-slate-500 mt-2">Pick the tier that fits your lab. Upgrade any time.</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
                !yearly ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
                yearly ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Yearly
            </button>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <i className="fas fa-tag text-[10px]"></i>
            Save ~17% yearly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => {
            const price = yearly ? tier.yearly : tier.monthly;
            const isCustom = price === null;
            const monthlyEquivalent =
              yearly && !isCustom && tier.yearly! > 0 ? Math.round(tier.yearly! / 12) : null;

            return (
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
                  <span className="text-3xl font-black text-slate-900">
                    {isCustom ? "Custom" : formatCurrency(price!)}
                  </span>
                  {!isCustom && (
                    <span className="text-sm text-slate-400">
                      {tier.monthly === 0 ? "/month" : yearly ? "/year" : "/month"}
                    </span>
                  )}
                </div>
                {monthlyEquivalent !== null && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">
                    {formatCurrency(monthlyEquivalent)}/month billed annually
                  </p>
                )}

                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <i className="fas fa-check text-emerald-500 mt-0.5 text-xs"></i>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@thelabsuite.com"
                  className={`mt-6 block text-center rounded-lg text-sm font-semibold px-4 py-2.5 transition-colors ${
                    tier.highlighted
                      ? "bg-brand-600 hover:bg-brand-700 text-white"
                      : "border border-slate-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
