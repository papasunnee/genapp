import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getPendingSignupModel } from "@/models/PendingSignup";
import { getControlConnection } from "@/lib/controlPlane";
import { isPayablePlan, getPlanAmount } from "@/lib/pricing";
import { initializeTransaction } from "@/lib/paystack";
import { validateEmail } from "@/utils/validateEmail";
import {
  normalizeSubdomain,
  isValidSubdomainFormat,
  isReservedSubdomain,
} from "@/lib/subdomainValidation";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Starts a self-serve signup: validates the org/admin details the visitor
 * entered, stashes them as a PendingSignup (nothing about the organization
 * is created yet - only a successful payment does that), and returns a
 * Paystack checkout URL to redirect the browser to.
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(`signup:${getClientIp(req)}`, 8, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many signup attempts. Try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minute(s).`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      organizationName,
      subdomain: rawSubdomain,
      adminFirstname,
      adminLastname,
      adminEmail,
      adminPassword,
      plan,
      billing,
    } = body;

    if (
      [organizationName, rawSubdomain, adminFirstname, adminLastname, adminEmail, adminPassword].some(
        (field) => typeof field !== "string" || !field
      ) ||
      !plan ||
      !billing
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    // These caps mirror Organization.name (120) and User.firstname/lastname
    // (60) - checked here, before any payment is taken, rather than only
    // at provisioning time after a successful charge. A failure there is
    // hidden behind a generic "contact support" message on the callback
    // page since the customer has already paid by that point.
    if (organizationName.length > 120) {
      return NextResponse.json(
        { success: false, error: "Organization name cannot be more than 120 characters" },
        { status: 400 }
      );
    }
    if (adminFirstname.length > 60 || adminLastname.length > 60) {
      return NextResponse.json(
        { success: false, error: "Name cannot be more than 60 characters" },
        { status: 400 }
      );
    }

    if (!isPayablePlan(plan)) {
      return NextResponse.json(
        { success: false, error: "Invalid plan for self-serve signup" },
        { status: 400 }
      );
    }
    if (billing !== "monthly" && billing !== "yearly") {
      return NextResponse.json(
        { success: false, error: "Invalid billing cycle" },
        { status: 400 }
      );
    }
    if (!validateEmail(adminEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid admin email" },
        { status: 400 }
      );
    }
    if (String(adminPassword).length < 8 || String(adminPassword).length > 128) {
      return NextResponse.json(
        { success: false, error: "Password must be between 8 and 128 characters" },
        { status: 400 }
      );
    }

    const subdomain = normalizeSubdomain(String(rawSubdomain));
    if (subdomain.length > 63) {
      return NextResponse.json(
        { success: false, error: "Subdomain cannot be more than 63 characters" },
        { status: 400 }
      );
    }
    if (!isValidSubdomainFormat(subdomain)) {
      return NextResponse.json(
        {
          success: false,
          error: "Subdomain must be lowercase letters, digits, and hyphens only",
        },
        { status: 400 }
      );
    }
    if (isReservedSubdomain(subdomain)) {
      return NextResponse.json(
        { success: false, error: "That subdomain is reserved - please choose another" },
        { status: 400 }
      );
    }

    const controlConn = await getControlConnection();
    const Organization = getOrganizationModel(controlConn);
    const existing = await Organization.findOne({ subdomain });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "That subdomain is already taken" },
        { status: 409 }
      );
    }

    const PendingSignup = getPendingSignupModel(controlConn);
    const pendingClaim = await PendingSignup.findOne({ subdomain });
    if (pendingClaim) {
      return NextResponse.json(
        {
          success: false,
          error: "Someone else is already checking out with that subdomain - please choose another",
        },
        { status: 409 }
      );
    }

    const reference = `signup_${crypto.randomUUID()}`;
    await PendingSignup.create({
      reference,
      organizationName,
      subdomain,
      adminFirstname,
      adminLastname,
      adminEmail,
      adminPassword,
      plan,
      billing,
    });

    const amountKobo = getPlanAmount(plan, billing) * 100;
    const { authorizationUrl } = await initializeTransaction({
      email: adminEmail,
      amountKobo,
      reference,
      callbackUrl: `${req.nextUrl.origin}/payment/callback`,
      metadata: { organizationName, subdomain, plan, billing },
    });

    return NextResponse.json({ success: true, data: { authorizationUrl } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
