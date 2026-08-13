import { uploadBrandAsset } from "@/lib/storage/r2";
import { getWorkspaceContextFromRequest } from "@/lib/workspace-context";

export async function POST(request: Request) {
  try {
    const { membership } = await getWorkspaceContextFromRequest(request);
    const form = await request.formData();
    const file = form.get("logo");
    if (!(file instanceof File)) return Response.json({ ok: false, error: "Choose a logo image first." }, { status: 400 });
    const logoUrl = await uploadBrandAsset(file, membership.organizationId);
    return Response.json({ ok: true, logoUrl });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Logo could not be uploaded." }, { status: 503 });
  }
}
