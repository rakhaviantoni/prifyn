import { prifynService } from "@/lib/server/hono";

export function GET(request: Request) {
  return prifynService.fetch(request);
}
