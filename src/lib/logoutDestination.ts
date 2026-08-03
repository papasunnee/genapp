/**
 * Where signing out should land: the demo organization has no real login
 * page a visitor should see again (it's a shared, credential-less
 * sandbox) - send them back to the public /demo entry page instead of a
 * tenant login form for an org they were never meant to "sign back into".
 * Every other organization keeps the normal behavior (its own login page).
 */
export function getLogoutDestination(session: { user?: { organizationSubdomain?: string } } | null | undefined): string {
  return session?.user?.organizationSubdomain === "demo" ? "/demo" : "/";
}
