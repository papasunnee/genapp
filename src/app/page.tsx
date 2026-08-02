import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { resolveTenant, TenantResolutionError } from "@/lib/tenantContext";
import Auth from "@/components/Layout/Auth";
import Login from "@/components/Form/Login";
import LandingPage from "@/components/Marketing/LandingPage";

export default async function IndexPage() {
  const headersList = await headers();

  // Checked before tenant resolution: a session already carries its own
  // organizationId, so a logged-in visitor on a host with no subdomain
  // (e.g. this deployment's bare vercel.app URL, or the demo) still knows
  // exactly where to go - it shouldn't matter that the Host header alone
  // can't resolve a tenant.
  const session = await auth();
  if (session) {
    redirect("/admin");
  }

  try {
    await resolveTenant(headersList.get("host"));
  } catch (error) {
    if (error instanceof TenantResolutionError) {
      // The bare root domain (no subdomain at all) isn't a broken tenant
      // lookup - it's just the marketing site. Any other reason (unknown
      // or suspended subdomain) is a real error worth the unauthorized page.
      if (error.reason === "no-subdomain") {
        return <LandingPage />;
      }
      redirect(`/unauthorized?reason=${error.reason}`);
    }
    throw error;
  }

  return (
    <Auth>
      <Login />
    </Auth>
  );
}
