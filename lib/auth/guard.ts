import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
