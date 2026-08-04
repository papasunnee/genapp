"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/functions";
import { toast } from "@/components/ui/Toast";
import Skeleton from "@/components/ui/Skeleton";
import { PayablePlan } from "@/lib/pricing";

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const diffMs = new Date(date).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

const STATUS_STYLES: Record<string, string> = {
  Trial: "bg-sky-50 text-sky-700",
  Active: "bg-emerald-50 text-emerald-700",
  Expired: "bg-red-50 text-red-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

export default function BillingDashboard() {
  const { data: statusData, isLoading: statusLoading } = useSWR(
    "/api/billing/status",
    fetcher
  );
  const { data: historyData, isLoading: historyLoading } = useSWR(
    "/api/billing/history",
    fetcher
  );
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [upgradePlan, setUpgradePlan] = useState<PayablePlan>("Starter");
  const [renewing, setRenewing] = useState(false);

  const status = statusData?.data;
  const history = historyData?.data || [];
  const remaining = status ? daysUntil(status.subscriptionRenewsAt) : null;
  const isFreeTrial = status?.plan === "Free";

  async function handleRenew() {
    setRenewing(true);
    try {
      const res = await fetch("/api/billing/renew/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isFreeTrial ? { billing, plan: upgradePlan } : { billing }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Could not start checkout");
        setRenewing(false);
        return;
      }
      window.location.href = json.data.authorizationUrl;
    } catch {
      toast.error("Could not reach the server. Please try again.");
      setRenewing(false);
    }
  }

  if (statusLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Current Plan
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">{status?.plan}</p>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${
              STATUS_STYLES[status?.subscriptionStatus] || "bg-slate-100 text-slate-600"
            }`}
          >
            {status?.subscriptionStatus}
          </span>
        </div>

        {status?.subscriptionRenewsAt && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {(status.subscriptionStatus === "Active" || status.subscriptionStatus === "Trial") &&
              remaining !== null &&
              remaining >= 0 && (
                <p className={`text-sm font-medium ${remaining <= 7 ? "text-amber-600" : "text-slate-500"}`}>
                  <i className="fas fa-clock mr-1.5"></i>
                  {isFreeTrial
                    ? remaining === 0
                      ? "Your free trial ends today"
                      : `Your free trial ends in ${remaining} day${remaining === 1 ? "" : "s"} - ${new Date(
                          status.subscriptionRenewsAt
                        ).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}`
                    : remaining === 0
                    ? "Renews today"
                    : `Renews in ${remaining} day${remaining === 1 ? "" : "s"} - ${new Date(
                        status.subscriptionRenewsAt
                      ).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}`}
                </p>
              )}
            {(status.subscriptionStatus === "Expired" || status.subscriptionStatus === "Cancelled") && (
              <p className="text-sm font-medium text-red-600">
                <i className="fas fa-exclamation-circle mr-1.5"></i>
                {isFreeTrial
                  ? `Your free trial ended on ${new Date(status.subscriptionRenewsAt).toLocaleDateString(
                      "en-NG",
                      { year: "numeric", month: "long", day: "numeric" }
                    )} - upgrade below to keep using LabSuite.`
                  : `Subscription ${status.subscriptionStatus.toLowerCase()} on ${new Date(
                      status.subscriptionRenewsAt
                    ).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} - you're currently limited to Free-tier features until you renew.`}
              </p>
            )}
          </div>
        )}

        {status?.isPayablePlan && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Renew {status.plan}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center bg-slate-100 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    billing === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Monthly - {formatCurrency(status.prices?.[status.plan]?.monthly)}
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    billing === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Yearly - {formatCurrency(status.prices?.[status.plan]?.yearly)}
                </button>
              </div>
              <button
                type="button"
                disabled={renewing}
                onClick={handleRenew}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                {renewing ? "Redirecting to Paystack..." : "Renew Now"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Renewing before your current period ends extends from your existing renewal date -
              you never lose paid time.
            </p>
          </div>
        )}

        {isFreeTrial && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Upgrade to a paid plan
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(["Starter", "Pro"] as PayablePlan[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setUpgradePlan(p)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    upgradePlan === p
                      ? "border-brand-600 ring-1 ring-brand-600 bg-brand-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-900">{p}</p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(status.prices?.[p]?.monthly)}/mo
                  </p>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center bg-slate-100 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    billing === "monthly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Monthly - {formatCurrency(status.prices?.[upgradePlan]?.monthly)}
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    billing === "yearly" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                  }`}
                >
                  Yearly - {formatCurrency(status.prices?.[upgradePlan]?.yearly)}
                </button>
              </div>
              <button
                type="button"
                disabled={renewing}
                onClick={handleRenew}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                {renewing ? "Redirecting to Paystack..." : `Upgrade to ${upgradePlan}`}
              </button>
            </div>
          </div>
        )}

        {status?.plan === "Enterprise" && (
          <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
            Enterprise billing is managed directly - contact hello@thelabsuite.com for changes.
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
          Subscription History
        </p>
        {historyLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No subscription events yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((event: any) => (
              <div key={event._id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">{event.note || event.plan}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(event.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-800">
                    {event.amount > 0 ? formatCurrency(event.amount) : "-"}
                  </p>
                  <p className="text-xs text-slate-400">{event.subscriptionStatus}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
