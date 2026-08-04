import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unauthorized",
  robots: { index: false, follow: false },
};

type Reason = "suspended" | "not-found" | "no-subdomain" | "forbidden" | undefined;

const CONTENT: Record<
  NonNullable<Reason> | "default",
  { icon: string; title: string; message: string }
> = {
  suspended: {
    icon: "fa-ban",
    title: "Organization suspended",
    message:
      "This organization's account has been suspended. Contact your administrator or LabSuite support to have it reactivated.",
  },
  "not-found": {
    icon: "fa-question-circle",
    title: "Organization not found",
    message:
      "We couldn't find a lab account for this address. Double-check the URL, or contact your lab administrator for the correct link.",
  },
  "no-subdomain": {
    icon: "fa-unlink",
    title: "Wrong address",
    message:
      "This page has to be opened through your organization's own address (e.g. yourlab.thelabsuite.com), not the base site.",
  },
  forbidden: {
    icon: "fa-lock",
    title: "Access restricted",
    message: "Your account doesn't have permission to view this page.",
  },
  default: {
    icon: "fa-exclamation-triangle",
    title: "Unauthorized",
    message: "You don't have access to this page.",
  },
};

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const content = CONTENT[(reason as Reason) ?? "default"] ?? CONTENT.default;
  const isForbidden = reason === "forbidden";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <i className={`fas ${content.icon} text-2xl text-red-500`}></i>
        </div>
        <h1 className="text-lg font-semibold text-slate-800 mb-2">{content.title}</h1>
        <p className="text-sm text-slate-500 mb-6">{content.message}</p>
        <a
          href={isForbidden ? "/admin" : "/"}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors w-full"
        >
          {isForbidden ? "Back to Dashboard" : "Back to Login"}
        </a>
      </div>
    </div>
  );
}
