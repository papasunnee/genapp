"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import { formatCurrency } from "@/utils/functions";
import { PLAN_PRICES, PayablePlan, isPayablePlan } from "@/lib/pricing";

type SignupPlan = "Free" | PayablePlan;
const SELECTABLE_PLANS: SignupPlan[] = ["Free", "Starter", "Pro"];

const EMPTY_FORM = {
  organizationName: "",
  subdomain: "",
  adminFirstname: "",
  adminLastname: "",
  adminEmail: "",
  adminPassword: "",
};

type SubdomainCheck = {
  status: "idle" | "checking" | "available" | "taken";
  reason?: string;
  suggestions: string[];
};

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get("plan");
  const [plan, setPlan] = useState<SignupPlan>(
    requestedPlan === "Free" ? "Free" : isPayablePlan(requestedPlan) ? requestedPlan : "Starter"
  );
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [subdomainCheck, setSubdomainCheck] = useState<SubdomainCheck>({
    status: "idle",
    suggestions: [],
  });
  const checkSeq = useRef(0);

  const amount = isPayablePlan(plan) ? PLAN_PRICES[plan][billing] : 0;

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    const subdomain = form.subdomain;
    if (!subdomain) {
      setSubdomainCheck({ status: "idle", suggestions: [] });
      return;
    }
    setSubdomainCheck((prev) => ({ ...prev, status: "checking" }));
    const seq = ++checkSeq.current;
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          subdomain,
          name: form.organizationName,
        });
        const res = await fetch(`/api/signup/check-subdomain?${params.toString()}`);
        const json = await res.json();
        if (seq !== checkSeq.current) return; // a newer keystroke superseded this check
        if (!json.success) {
          setSubdomainCheck({ status: "idle", suggestions: [] });
          return;
        }
        setSubdomainCheck({
          status: json.data.available ? "available" : "taken",
          reason: json.data.reason,
          suggestions: json.data.suggestions || [],
        });
      } catch {
        if (seq === checkSeq.current) setSubdomainCheck({ status: "idle", suggestions: [] });
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.subdomain]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (subdomainCheck.status === "taken" || subdomainCheck.status === "checking") {
      toast.error("Please choose an available subdomain first");
      return;
    }
    setSubmitting(true);
    try {
      if (plan === "Free") {
        const res = await fetch("/api/signup/free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (!json.success) {
          toast.error(json.error || "Could not create your workspace");
          setSubmitting(false);
          return;
        }
        const params = new URLSearchParams({
          subdomain: json.data.subdomain,
          name: json.data.organizationName,
        });
        router.push(`/signup/success?${params.toString()}`);
        return;
      }

      const res = await fetch("/api/signup/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan, billing }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Could not start checkout");
        setSubmitting(false);
        return;
      }
      window.location.href = json.data.authorizationUrl;
    } catch {
      toast.error("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-lg mx-auto px-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <i className="fas fa-flask text-sm"></i>
            </div>
            <span className="font-black text-lg text-slate-900">LabSuite</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create your lab's workspace</h1>
          <p className="text-slate-500 mt-1 text-sm">
            You'll be redirected to Paystack to complete payment, then your workspace is
            ready instantly.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
        >
          <div className="grid grid-cols-3 gap-3">
            {SELECTABLE_PLANS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  plan === p
                    ? "border-brand-600 ring-1 ring-brand-600 bg-brand-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-bold text-slate-900">{p}</p>
                <p className="text-xs text-slate-500">
                  {p === "Free" ? "₦0/mo" : `${formatCurrency(PLAN_PRICES[p].monthly)}/mo`}
                </p>
              </button>
            ))}
          </div>

          {isPayablePlan(plan) && (
            <>
              <div className="inline-flex items-center bg-slate-100 rounded-full p-1 w-full">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    billing === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    billing === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Yearly (save ~17%)
                </button>
              </div>

              <p className="text-center text-sm text-slate-600">
                Total due today:{" "}
                <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
              </p>
            </>
          )}

          {plan === "Free" && (
            <p className="text-center text-sm text-slate-500">
              No payment required - your workspace is created instantly.
            </p>
          )}

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Organization name
              </label>
              <input
                required
                maxLength={120}
                value={form.organizationName}
                onChange={(e) => update("organizationName", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Acme Diagnostics"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Subdomain
              </label>
              <div
                className={`flex items-center rounded-lg border focus-within:ring-2 overflow-hidden ${
                  subdomainCheck.status === "taken"
                    ? "border-red-300 focus-within:ring-red-400"
                    : subdomainCheck.status === "available"
                    ? "border-emerald-300 focus-within:ring-emerald-400"
                    : "border-slate-300 focus-within:ring-brand-500"
                }`}
              >
                <input
                  required
                  maxLength={63}
                  value={form.subdomain}
                  onChange={(e) =>
                    update("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  className="flex-grow px-3 py-2 text-sm focus:outline-none"
                  placeholder="acmelabs"
                />
                <span className="px-3 py-2 text-sm text-slate-400 bg-slate-50 whitespace-nowrap">
                  .thelabsuite.com
                </span>
              </div>

              {subdomainCheck.status === "checking" && (
                <p className="text-xs text-slate-400 mt-1.5">
                  <i className="fas fa-circle-notch fa-spin mr-1"></i>
                  Checking availability...
                </p>
              )}
              {subdomainCheck.status === "available" && (
                <p className="text-xs text-emerald-600 mt-1.5">
                  <i className="fas fa-check-circle mr-1"></i>
                  {form.subdomain}.thelabsuite.com is available
                </p>
              )}
              {subdomainCheck.status === "taken" && (
                <div className="mt-1.5">
                  <p className="text-xs text-red-600">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {subdomainCheck.reason || "That subdomain is unavailable"}
                  </p>
                  {subdomainCheck.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs text-slate-400 mt-1">Try:</span>
                      {subdomainCheck.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => update("subdomain", s)}
                          className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-2.5 py-1 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Admin first name
                </label>
                <input
                  required
                  maxLength={60}
                  value={form.adminFirstname}
                  onChange={(e) => update("adminFirstname", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Admin last name
                </label>
                <input
                  required
                  maxLength={60}
                  value={form.adminLastname}
                  onChange={(e) => update("adminLastname", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Admin email
              </label>
              <input
                required
                type="email"
                value={form.adminEmail}
                onChange={(e) => update("adminEmail", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Admin password
              </label>
              <input
                required
                minLength={8}
                type="password"
                value={form.adminPassword}
                onChange={(e) => update("adminPassword", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || subdomainCheck.status === "taken" || subdomainCheck.status === "checking"}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm px-4 py-2.5 transition-colors"
          >
            {submitting
              ? plan === "Free"
                ? "Creating your workspace..."
                : "Redirecting to Paystack..."
              : plan === "Free"
              ? "Create my workspace"
              : `Continue to payment - ${formatCurrency(amount)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
