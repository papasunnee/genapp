export const metadata = {
  title: "Workspace Ready",
  robots: { index: false, follow: false },
};

export default async function SignupSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ subdomain?: string; name?: string }>;
}) {
  const { subdomain, name } = await searchParams;
  const rootDomain = process.env.ROOT_DOMAIN || "localhost";
  const port = process.env.NODE_ENV === "production" ? "" : ":3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const loginUrl = subdomain ? `${protocol}://${subdomain}.${rootDomain}${port}` : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <i className="fas fa-check-circle text-2xl text-brand-600"></i>
        </div>
        <h1 className="text-lg font-semibold text-slate-800 mb-2">You&apos;re all set!</h1>
        <p className="text-sm text-slate-500 mb-6">
          {name ? `${name} is ready. ` : ""}Your workspace address is {loginUrl} - log in there
          with the admin email and password you just created. New addresses can take up to 24
          hours to become reachable while DNS finishes propagating; if it&apos;s still not
          loading after that, email us at hello@thelabsuite.com and we&apos;ll sort it out.
        </p>
        <a
          href={loginUrl}
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors w-full"
        >
          Go to your workspace
        </a>
      </div>
    </div>
  );
}
