import { createHash, createHmac, randomUUID } from "node:crypto";

function hex(buffer: Buffer) {
  return buffer.toString("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function isConfigured() {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET && process.env.R2_PUBLIC_BASE_URL);
}

export function isR2Configured() {
  return isConfigured();
}

export async function uploadBrandAsset(file: File, workspaceId: string) {
  if (!isConfigured()) throw new Error("Logo upload storage is not configured.");
  if (!file.type.startsWith("image/")) throw new Error("Upload an image file.");
  if (file.size > 2_000_000) throw new Error("Logo must be smaller than 2 MB.");

  const ext = file.type.includes("svg") ? "svg" : file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const key = `brands/${workspaceId}/${randomUUID()}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());
  const payloadHash = createHash("sha256").update(body).digest("hex");
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const host = `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const path = `/${process.env.R2_BUCKET}/${key}`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["PUT", path, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, createHash("sha256").update(canonicalRequest).digest("hex")].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${process.env.R2_SECRET_ACCESS_KEY}`, dateStamp), region), service), "aws4_request");
  const signature = hex(hmac(signingKey, stringToSign));
  const authorization = `AWS4-HMAC-SHA256 Credential=${process.env.R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`https://${host}${path}`, {
    method: "PUT",
    headers: {
      authorization,
      "content-type": file.type,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    body,
  });
  if (!response.ok) throw new Error(`Logo upload failed with status ${response.status}.`);
  return `${process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;
}
