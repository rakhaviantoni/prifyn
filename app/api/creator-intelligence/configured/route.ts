import { NextResponse } from "next/server";
import { creatorConnectorReadiness } from "@/lib/creator-intelligence";

export async function GET() {
  return NextResponse.json({ configured: true, connectors: creatorConnectorReadiness() });
}
