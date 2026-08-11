import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { accountTypeForPortal, destinationForAccountType, getOrCreateAccountProfile, isAllowedInPortal, type PortalType } from "./account-profile";
import { getAuth, isAuthConfigured } from "./server";

export async function requireWorkspaceSession(returnTo: string) {
  if (!isAuthConfigured()) redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);

  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    if (session?.user) return session;
  } catch {
    // Treat unavailable auth as signed out so private routes never expose app data.
  }

  redirect(`/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
}

export async function requirePortalSession(returnTo: string, portal: PortalType) {
  const session = await requireWorkspaceSession(returnTo);
  const profile = await getOrCreateAccountProfile(session.user.id, accountTypeForPortal(portal), session.user.name);

  if (!isAllowedInPortal(profile.accountType, portal)) {
    const destination = destinationForAccountType(profile.accountType);
    const reason = profile.accountType === "creator" ? "creator_only" : "brand_only";
    redirect(`${destination}?account=${reason}`);
  }

  return { session, profile };
}
