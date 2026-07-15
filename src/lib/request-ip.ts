import { createHash } from "node:crypto";
import { headers } from "next/headers";

export async function getClientIpHash(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex");
}
