import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth";
import {
  resolveTenantForRequest,
  TenantResolutionError,
} from "@/lib/tenantContext";
import { isPayablePlan } from "@/lib/pricing";
import Sidebar from "@/components/Sidebar/Sidebar";
import FooterAdmin from "@/components/Footers/FooterAdmin";

// Every tenant's private admin area - never indexed, regardless of what
// any individual page under here does or doesn't set.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function SubscriptionBanner({
  plan,
  subscriptionStatus,
  subscriptionRenewsAt,
}: {
  plan: string;
  subscriptionStatus: string;
  subscriptionRenewsAt: Date | null | undefined;
}) {
  const isTrial = plan === "Free" && subscriptionStatus !== "Active";
  if (!isPayablePlan(plan) && !isTrial) return null;

  const isLapsed = subscriptionStatus === "Expired" || subscriptionStatus === "Cancelled";
  const remaining = subscriptionRenewsAt
    ? Math.ceil((new Date(subscriptionRenewsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isApproaching =
    (subscriptionStatus === "Active" || subscriptionStatus === "Trial") &&
    remaining !== null &&
    remaining <= 7 &&
    remaining >= 0;

  if (!isLapsed && !isApproaching) return null;

  const message = isTrial
    ? isLapsed
      ? "Your free trial has ended - upgrade to a paid plan to keep using LabSuite."
      : `Your free trial ends in ${remaining} day${remaining === 1 ? "" : "s"} - upgrade to keep access after that.`
    : isLapsed
    ? "Your subscription has expired - you're limited to Free-tier features until you renew."
    : `Your subscription renews in ${remaining} day${remaining === 1 ? "" : "s"}.`;

  return (
    <div
      className={`relative text-white text-xs font-semibold text-center py-1.5 px-4 ${
        isLapsed ? "bg-red-600" : "bg-amber-500"
      }`}
    >
      <i className={`fas ${isLapsed ? "fa-exclamation-circle" : "fa-clock"} mr-1.5`}></i>
      {message}{" "}
      <Link href="/admin/billing" className="underline hover:no-underline">
        {isLapsed ? (isTrial ? "Upgrade now" : "Renew now") : "Manage billing"}
      </Link>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  const headersList = await headers();
  let tenant;
  try {
    tenant = await resolveTenantForRequest(headersList.get("host"), session);
  } catch (error) {
    if (error instanceof TenantResolutionError) {
      redirect(`/unauthorized?reason=${error.reason}`);
    }
    throw error;
  }

  // Defense in depth: a session issued for one organization should never
  // render another organization's admin area, even if replayed here.
  if (
    session.user?.organizationId &&
    session.user.organizationId !== tenant.organization._id.toString()
  ) {
    redirect("/");
  }

  // Free is a 30-day trial, not a perpetual tier - unlike a lapsed paid
  // plan (which softly falls back to Free-tier limits, see planLimits.ts),
  // there's no lower tier for an expired Free trial to fall back to, so
  // access is hard-blocked to just the billing page (where they can
  // upgrade) rather than quietly degraded.
  const isFreeTrialExpired =
    tenant.organization.plan === "Free" && tenant.organization.subscriptionStatus === "Expired";
  const pathname = headersList.get("x-pathname") || "";
  if (isFreeTrialExpired && !pathname.startsWith("/admin/billing")) {
    redirect("/admin/billing");
  }

  return (
    <>
      <Sidebar orgName={tenant.organization.name} />
      <div className="relative md:ml-64 bg-slate-100">
        {tenant.organization.isDemo && (
          <div className="bg-amber-500 relative text-white text-xs font-semibold text-center py-1 px-4">
            <i className="fas fa-info-circle mr-1.5"></i>
            You&apos;re in the public demo - a shared sandbox that resets
            periodically. Some settings are disabled.
          </div>
        )}
        {!tenant.organization.isDemo && (
          <SubscriptionBanner
            plan={tenant.organization.plan}
            subscriptionStatus={tenant.organization.subscriptionStatus}
            subscriptionRenewsAt={tenant.organization.subscriptionRenewsAt}
          />
        )}
        {children}
        <div className="px-4 md:px-10 mx-auto w-full mt-24">
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
