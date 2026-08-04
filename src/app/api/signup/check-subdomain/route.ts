import { NextRequest, NextResponse } from "next/server";
import { getOrganizationModel } from "@/models/Organization";
import { getPendingSignupModel } from "@/models/PendingSignup";
import { getControlConnection } from "@/lib/controlPlane";
import {
  normalizeSubdomain,
  isValidSubdomainFormat,
  isReservedSubdomain,
  slugify,
} from "@/lib/subdomainValidation";

async function isTaken(
  subdomain: string,
  Organization: ReturnType<typeof getOrganizationModel>,
  PendingSignup: ReturnType<typeof getPendingSignupModel>
): Promise<boolean> {
  if (isReservedSubdomain(subdomain) || !isValidSubdomainFormat(subdomain)) return true;
  const [org, pending] = await Promise.all([
    Organization.findOne({ subdomain }),
    PendingSignup.findOne({ subdomain }),
  ]);
  return !!(org || pending);
}

function candidateVariants(base: string): string[] {
  const trimmed = base.slice(0, 30);
  return [
    `${trimmed}lab`,
    `${trimmed}labs`,
    `${trimmed}diagnostics`,
    `${trimmed}ng`,
    `my${trimmed}`,
    `${trimmed}2`,
    `${trimmed}3`,
    `${trimmed}4`,
    `${trimmed}hq`,
    `the${trimmed}`,
  ];
}

/**
 * Live availability check used while the signup form's subdomain field is
 * being typed into - checked against both real Organizations and other
 * checkouts currently in progress. When taken, returns up to 3 available
 * alternatives derived from the requested name so the visitor isn't left
 * to guess.
 */
export async function GET(req: NextRequest) {
  const rawSubdomain = req.nextUrl.searchParams.get("subdomain") || "";
  const rawName = req.nextUrl.searchParams.get("name") || "";
  const subdomain = normalizeSubdomain(rawSubdomain);

  if (!subdomain) {
    return NextResponse.json({ success: true, data: { available: false, suggestions: [] } });
  }

  if (!isValidSubdomainFormat(subdomain)) {
    return NextResponse.json({
      success: true,
      data: {
        available: false,
        reason: "Lowercase letters, digits, and hyphens only",
        suggestions: [],
      },
    });
  }

  const controlConn = await getControlConnection();
  const Organization = getOrganizationModel(controlConn);
  const PendingSignup = getPendingSignupModel(controlConn);

  const taken = await isTaken(subdomain, Organization, PendingSignup);
  if (!taken) {
    return NextResponse.json({ success: true, data: { available: true, suggestions: [] } });
  }

  const base = slugify(rawName) || subdomain;
  const suggestions: string[] = [];
  for (const candidate of candidateVariants(base)) {
    if (suggestions.length >= 3) break;
    if (candidate === subdomain) continue;
    const candidateTaken = await isTaken(candidate, Organization, PendingSignup);
    if (!candidateTaken) suggestions.push(candidate);
  }

  return NextResponse.json({
    success: true,
    data: {
      available: false,
      reason: isReservedSubdomain(subdomain) ? "That subdomain is reserved" : "Already taken",
      suggestions,
    },
  });
}
