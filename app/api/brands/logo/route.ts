import { prifynService } from "@/lib/server/hono";

export function POST(request: Request) {
  return prifynService.fetch(request);
}
