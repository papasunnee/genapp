import { provisionOrganizationFromReference } from "@/lib/provisionOrganization";

export const metadata = {
  title: "Confirming Payment",
  robots: { index: false, follow: false },
};

async function resolveOutcome(reference: string | undefined) {
  if (!reference) {
    return {
      icon: "fa-exclamation-triangle",
      title: "Missing payment reference",
      message: "We couldn't find a payment reference on this link. If you just paid, check your email or contact support.",
      loginUrl: null as string | null,
    };
  }

  try {
    const result = await provisionOrganizationFromReference(reference);

    if (result.status === "success") {
      const rootDomain = process.env.ROOT_DOMAIN || "localhost";
      const port = process.env.NODE_ENV === "production" ? "" : ":3000";
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const loginUrl = `${protocol}://${result.subdomain}.${rootDomain}${port}`;
      return {
        icon: "fa-check-circle",
        title: "You're all set!",
        message: `${result.organizationName} is ready. Your workspace address is ${loginUrl} - log in there with the admin email and password you just created. New addresses can take up to 24 hours to become reachable while DNS finishes propagating; if it's still not loading after that, email us at hello@thelabsuite.com and we'll sort it out.`,
        loginUrl,
      };
    }

    if (result.status === "not-paid") {
      return {
        icon: "fa-times-circle",
        title: "Payment not completed",
        message: "Your payment wasn't confirmed as successful, so no workspace was created. No charge should have gone through - please try signing up again.",
        loginUrl: null,
      };
    }

    if (result.status === "subdomain-conflict") {
      return {
        icon: "fa-exclamation-triangle",
        title: "That subdomain was just taken",
        message: "Someone else registered the same subdomain while your payment was processing. If you were charged, contact support with your payment reference and we'll set up your workspace under a different address right away.",
        loginUrl: null,
      };
    }

    return {
      icon: "fa-check-circle",
      title: "Payment received",
      message: "Your workspace has already been set up from this payment. Check your email for your organization's address, or contact support if you can't find it.",
      loginUrl: null,
    };
  } catch (error: any) {
    console.error("Signup callback provisioning error:", error);
    return {
      icon: "fa-exclamation-triangle",
      title: "Something went wrong",
      message: "We couldn't confirm your payment automatically. If you were charged, contact support with your payment reference and we'll get your workspace set up.",
      loginUrl: null,
    };
  }
}

export default async function SignupCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = params.reference || params.trxref;
  const outcome = await resolveOutcome(reference);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <i className={`fas ${outcome.icon} text-2xl text-brand-600`}></i>
        </div>
        <h1 className="text-lg font-semibold text-slate-800 mb-2">{outcome.title}</h1>
        <p className="text-sm text-slate-500 mb-6">{outcome.message}</p>
        <a
          href={outcome.loginUrl || "/"}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors w-full"
        >
          {outcome.loginUrl ? "Go to your workspace" : "Back to Home"}
        </a>
      </div>
    </div>
  );
}
