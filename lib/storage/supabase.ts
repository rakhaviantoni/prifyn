import { randomUUID } from "node:crypto";

function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
}

function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
}

function bucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "prifyn-assets";
}

export function isSupabaseStorageConfigured() {
  return Boolean(supabaseUrl() && serviceKey());
}

export async function uploadBrandAsset(file: File, workspaceId: string) {
  const baseUrl = supabaseUrl();
  const key = serviceKey();
  if (!baseUrl || !key) throw new Error("Supabase Storage is not configured.");
  if (!file.type.startsWith("image/")) throw new Error("Upload an image file.");
  if (file.size > 2_000_000) throw new Error("Logo must be smaller than 2 MB.");

  const ext = file.type.includes("svg") ? "svg" : file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const objectKey = `brands/${workspaceId}/${randomUUID()}.${ext}`;
  const storageUrl = `${baseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket()}/${objectKey}`;
  const response = await fetch(storageUrl, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": file.type,
      "x-upsert": "false",
    },
    body: file,
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Supabase logo upload failed with status ${response.status}.`);
  }
  return `${baseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket()}/${objectKey}`;
}
