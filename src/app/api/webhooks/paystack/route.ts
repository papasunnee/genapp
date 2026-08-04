import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { provisionOrganizationFromReference } from "@/lib/provisionOrganization";
import { provisionRenewalFromReference } from "@/lib/provisionRenewal";

/**
 * Server-to-server notification from Paystack - the durable path for
 * provisioning in case the customer's browser never makes it back to
 * /payment/callback (closed tab, network drop mid-redirect, etc). The
 * callback page does the same provisioning call for the common case where
 * the browser does return, so whichever of the two fires first wins; see
 * provisionOrganizationFromReference for how that race is resolved.
 *
 * Always acknowledges with 200 once the signature checks out, even if
 * provisioning itself errors - Paystack retries on non-2xx, and a genuine
 * bug here should surface in logs/monitoring rather than as a retry storm.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }

  if (event?.event === "charge.success") {
    const reference = event?.data?.reference;
    if (reference) {
      try {
        if (reference.startsWith("renewal_")) {
          await provisionRenewalFromReference(reference);
        } else {
          await provisionOrganizationFromReference(reference);
        }
      } catch (error) {
        console.error("Paystack webhook provisioning failed:", error);
      }
    }
  }

  return NextResponse.json({ success: true });
}
