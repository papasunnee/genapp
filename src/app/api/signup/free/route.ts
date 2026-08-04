import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getPendingSignupModel } from "@/models/PendingSignup";
import { getControlConnection } from "@/lib/controlPlane";
import { createOrganizationAndSeed } from "@/lib/provisionOrganization";
import { validateEmail } from "@/utils/validateEmail";
import {
  normalizeSubdomain,
  isValidSubdomainFormat,
  isReservedSubdomain,
} from "@/lib/subdomainValidation";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Free-plan signup skips Paystack entirely - there's nothing to pay, so
 * the organization is created immediately rather than waiting on a
 * checkout callback/webhook the way Starter/Pro signups do.
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
    } = body;

    if (
      [organizationName, rawSubdomain, adminFirstname, adminLastname, adminEmail, adminPassword].some(
        (field) => typeof field !== "string" || !field
      )
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
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
    if (!validateEmail(adminEmail)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid admin email" },
        { status: 400 }
      );
    }
    if (String(adminPassword).length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
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
    const existingOrg = await Organization.findOne({ subdomain });
    if (existingOrg) {
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

    // Free is a 30-day trial, not a perpetual tier - once it lapses without
    // an upgrade to a paid plan, the org is locked out of everything except
    // the billing page (see admin/layout.tsx) until they upgrade.
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const result = await createOrganizationAndSeed({
      organizationName,
      subdomain,
      adminFirstname,
      adminLastname,
      adminEmail,
      adminPassword,
      plan: "Free",
      subscriptionStatus: "Trial",
      subscriptionRenewsAt: trialEndsAt,
      eventAmount: 0,
      eventNote: "Self-serve Free plan signup (30-day trial)",
    });

    return NextResponse.json({
      success: true,
      data: { subdomain: result.subdomain, organizationName: result.organizationName },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, error: "That subdomain is already taken" },
        { status: 409 }
      );
    }
    console.error("Free signup failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
