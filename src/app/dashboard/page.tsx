import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { resolveTenant, TenantResolutionError } from "@/lib/tenantContext";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  const headersList = await headers();
  try {
    await resolveTenant(headersList.get("host"));
  } catch (error) {
    if (error instanceof TenantResolutionError) {
      redirect(`/unauthorized?reason=${error.reason}`);
    }
    throw error;
  }

  return <div>Index</div>;
}
