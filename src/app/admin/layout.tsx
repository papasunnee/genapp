import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { resolveTenantForRequest, TenantResolutionError } from "@/lib/tenantContext";
import Sidebar from "@/components/Sidebar/Sidebar";
import FooterAdmin from "@/components/Footers/FooterAdmin";

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

  return (
    <>
      <Sidebar orgName={tenant.organization.name} />
      <div className="relative md:ml-64 bg-slate-100">
        {tenant.organization.isDemo && (
          <div className="bg-amber-500 text-white text-xs font-semibold text-center py-1.5 px-4">
            <i className="fas fa-info-circle mr-1.5"></i>
            You&apos;re in the public demo - a shared sandbox that resets periodically. Some
            settings are disabled.
          </div>
        )}
        {children}
        <div className="px-4 md:px-10 mx-auto w-full mt-24">
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
