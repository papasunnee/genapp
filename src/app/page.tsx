import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { resolveTenant, TenantResolutionError } from "@/lib/tenantContext";
import { getSubdomainFromHost } from "@/lib/subdomain";
import Auth from "@/components/Layout/Auth";
import Login from "@/components/Form/Login";
import LandingPage from "@/components/Marketing/LandingPage";

// This one route serves two very different pages depending on the host:
// the public marketing site on the bare root domain (should be indexed,
// with real SEO metadata), or a specific tenant's private login page on a
// subdomain (should never be indexed) - generateMetadata reads the host
// per-request to tell them apart, since a static `metadata` export can't.
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const subdomain = getSubdomainFromHost(headersList.get("host"));

  if (subdomain) {
    return { robots: { index: false, follow: false } };
  }

  return {
    title: "LabSuite - Run Your Diagnostic Lab From One Place",
    description:
      "Patient records, test orders, results, payments, and branded reports - LabSuite gives every diagnostic lab its own private, isolated workspace to run day-to-day operations without spreadsheets.",
  };
}

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
