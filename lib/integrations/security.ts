const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

export async function hashIntegrationState(state: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(state));
  return toBase64Url(new Uint8Array(digest));
}

export function createIntegrationState() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function encryptIntegrationCredentials(payload: Record<string, unknown>) {
  const secret = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) throw new Error("INTEGRATION_TOKEN_ENCRYPTION_KEY must contain at least 32 characters.");
  const keyBytes = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  return `v1.${toBase64Url(iv)}.${toBase64Url(new Uint8Array(ciphertext))}`;
}
