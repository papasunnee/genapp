import Link from "next/link";
import AdminNavbar from "@/components/Navbars/AdminNavbar";
import { provisionRenewalFromReference } from "@/lib/provisionRenewal";

export const metadata = {
  title: "Confirming Renewal - LabSuite",
};

async function resolveOutcome(reference: string | undefined) {
  if (!reference) {
    return {
      icon: "fa-exclamation-triangle",
      title: "Missing payment reference",
      message: "We couldn't find a payment reference on this link.",
    };
  }

  try {
    const result = await provisionRenewalFromReference(reference);

    if (result.status === "success") {
      return {
        icon: "fa-check-circle",
        title: "Subscription renewed",
        message: `You're all set - your subscription is now active until ${new Date(
          result.renewsAt
        ).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}.`,
      };
    }

    if (result.status === "not-paid") {
      return {
        icon: "fa-times-circle",
        title: "Payment not completed",
        message: "Your payment wasn't confirmed as successful, so your subscription wasn't renewed. No charge should have gone through - please try again.",
      };
    }

    return {
      icon: "fa-exclamation-triangle",
      title: "Couldn't confirm renewal",
      message: "We couldn't process this renewal automatically. If you were charged, contact support with your payment reference.",
    };
  } catch (error) {
    console.error("Billing callback error:", error);
    return {
      icon: "fa-exclamation-triangle",
      title: "Something went wrong",
      message: "We couldn't confirm your payment automatically. If you were charged, contact support with your payment reference.",
    };
  }
}

export default async function BillingCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference || params.trxref;
  const outcome = await resolveOutcome(reference);

  return (
    <>
      <AdminNavbar breadCrumb={["Dashboard", "Billing", "Confirming Renewal"]} />
      <div className="relative bg-slate-800 md:pt-32 pb-32 pt-12">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div></div>
        </div>
      </div>
      <div className="flex flex-wrap px-4 md:px-10 mx-auto w-full -m-24">
        <div className="w-full mb-12 md:px-4">
          <div className="max-w-sm mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="h-14 w-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
              <i className={`fas ${outcome.icon} text-2xl text-brand-600`}></i>
            </div>
            <h1 className="text-lg font-semibold text-slate-800 mb-2">{outcome.title}</h1>
            <p className="text-sm text-slate-500 mb-6">{outcome.message}</p>
            <Link
              href="/admin/billing"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors w-full"
            >
              Back to Billing
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
