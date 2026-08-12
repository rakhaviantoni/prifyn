import { z } from "zod";
import { brandDetail, brandInitials, getWorkspaceContextFromRequest, upsertWorkspaceBrand } from "@/lib/workspace-context";

const BrandPayload = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2).max(120),
  type: z.string().trim().min(2).max(80).optional().nullable(),
});

function toPublicBrand(brand: Awaited<ReturnType<typeof getWorkspaceContextFromRequest>>["brand"]) {
  return {
    id: brand.id,
    initials: brandInitials(brand.name),
    name: brand.name,
    detail: brandDetail(brand),
    type: brand.type,
  };
}

export async function GET(request: Request) {
  try {
    const { brand, brands } = await getWorkspaceContextFromRequest(request);
    return Response.json({ activeBrandId: brand.id, brands: brands.map(toPublicBrand) });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ brands: [], reason: "brand_unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = BrandPayload.parse(await request.json());
    const { brand } = await upsertWorkspaceBrand(request.headers, payload);
    return Response.json({ brand: toPublicBrand(brand) });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof z.ZodError) return Response.json({ error: "Brand profile is incomplete.", details: error.flatten() }, { status: 400 });
    return Response.json({ error: "Brand profile could not be saved." }, { status: 503 });
  }
}
