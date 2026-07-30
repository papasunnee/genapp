import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { resolveTenant, TenantResolutionError } from "@/lib/tenantContext";
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
    tenant = await resolveTenant(headersList.get("host"));
  } catch (error) {
    if (error instanceof TenantResolutionError) {
      redirect("/unauthorized");
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
        {children}
        <div className="px-4 md:px-10 mx-auto w-full mt-24">
          <FooterAdmin />
        </div>
      </div>
    </>
  );
}
