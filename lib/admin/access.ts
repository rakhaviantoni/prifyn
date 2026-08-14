import { getAuth, isAuthConfigured } from "@/lib/auth/server";

export type AdminSession = { user: { id: string; email?: string | null; name?: string | null } };

export function adminEmails() {
  return (process.env.PRIFYN_ADMIN_EMAILS || process.env.PRIFYN_ADMIN_EMAIL || "privynindonesia@gmail.com")
    .split(",")
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPrifynAdminEmail(email?: string | null) {
  return Boolean(email && adminEmails().includes(email.toLowerCase()));
}

export async function getAdminSession(headers: Headers): Promise<AdminSession | null> {
  if (!isAuthConfigured()) return null;
  try {
    const session = await getAuth().api.getSession({ headers });
    if (!session?.user || !isPrifynAdminEmail(session.user.email)) return null;
    return { user: { id: session.user.id, email: session.user.email, name: session.user.name } };
  } catch {
    return null;
  }
}
