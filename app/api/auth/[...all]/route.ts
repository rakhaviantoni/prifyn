import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

async function unavailable() {
  return Response.json({ code: "AUTH_NOT_CONFIGURED", message: "Sign-in is not available yet. Please ask the workspace admin to finish setup." }, { status: 503 });
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  try {
    return await toNextJsHandler(getAuth()).GET(request);
  } catch (error) {
    console.error("PRIFYN auth GET failed", error);
    return Response.json({ code: "AUTH_HANDLER_FAILED", message: "Sign-in is not available right now. Please try again in a few minutes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  try {
    return await toNextJsHandler(getAuth()).POST(request);
  } catch (error) {
    console.error("PRIFYN auth POST failed", error);
    return Response.json({ code: "AUTH_HANDLER_FAILED", message: "Google sign-in could not be started. Please try again in a few minutes." }, { status: 500 });
  }
}
