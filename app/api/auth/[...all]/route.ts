import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

async function unavailable() {
  return Response.json({ code: "AUTH_NOT_CONFIGURED", message: "Google OAuth and database credentials have not been supplied yet." }, { status: 503 });
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  return toNextJsHandler(getAuth()).POST(request);
}
