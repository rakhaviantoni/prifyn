import { getAdminSession } from "@/lib/admin/access";
import { getAdminOverview } from "@/lib/admin/overview";

export async function GET(request: Request) {
  const admin = await getAdminSession(request.headers);
  if (!admin) return Response.json({ ok: false, error: "Admin access is required." }, { status: 403 });

  try {
    return Response.json({ ok: true, overview: await getAdminOverview() });
  } catch {
    return Response.json({ ok: false, error: "Business Manager data could not be loaded yet." }, { status: 503 });
  }
}
