import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { resolveTenant, TenantResolutionError } from "@/lib/tenantContext";
import Auth from "@/components/Layout/Auth";
import Login from "@/components/Form/Login";
import LandingPage from "@/components/Marketing/LandingPage";

export default async function IndexPage() {
  const headersList = await headers();
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
