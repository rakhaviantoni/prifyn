import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

async function unavailable() {
  return Response.json({ code: "AUTH_NOT_CONFIGURED", message: "Sign-in is not available yet. Please ask the workspace admin to finish setup." }, { status: 503 });
}

function classifyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();
  if (lower.includes("database") || lower.includes("postgres") || lower.includes("hyperdrive") || lower.includes("enoidentifier") || lower.includes("sqlstate")) {
    return "database";
  }
  if (lower.includes("origin") || lower.includes("callback") || lower.includes("trusted")) {
    return "origin";
  }
  return "auth_handler";
}

export async function GET(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  try {
    return await toNextJsHandler(getAuth()).GET(request);
  } catch (error) {
    console.error("PRIFYN auth GET failed", error);
    return Response.json({ code: "AUTH_HANDLER_FAILED", reason: classifyAuthError(error), message: "Sign-in is not available right now. Please try again in a few minutes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) return unavailable();
  try {
    return await toNextJsHandler(getAuth()).POST(request);
  } catch (error) {
    console.error("PRIFYN auth POST failed", error);
    return Response.json({ code: "AUTH_HANDLER_FAILED", reason: classifyAuthError(error), message: "Google sign-in could not be started. Please try again in a few minutes." }, { status: 500 });
  }
}
