import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { resolveTenant, TenantResolutionError } from "@/lib/tenantContext";
import Auth from "@/components/Layout/Auth";
import Login from "@/components/Form/Login";

export default async function IndexPage() {
  const headersList = await headers();
  try {
    await resolveTenant(headersList.get("host"));
  } catch (error) {
    if (error instanceof TenantResolutionError) {
      redirect(`/unauthorized?reason=${error.reason}`);
    }
    throw error;
  }

  const session = await auth();
  if (session) {
    redirect("/admin");
  }

  return (
    <Auth>
      <Login />
    </Auth>
  );
}
