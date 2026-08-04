import { isAuthConfigured } from "@/lib/auth/server";

export async function GET() {
  if (!isAuthConfigured()) return Response.json({ configured: false }, { status: 503 });
  return Response.json({ configured: true });
}
