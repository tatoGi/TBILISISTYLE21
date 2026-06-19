import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Next.js 16: the `middleware` convention was renamed to `proxy`.
// This runs before routes are rendered, for every matched request.
//
// Purpose: a coarse, global first line of defense against request floods,
// applied to ALL routes (the per-route limiters in lib/rate-limit only guard
// a handful of sensitive endpoints like login/payments).
//
// IMPORTANT — read before tuning:
// Proxy is deployed per-instance (and may run at the edge), so its in-memory
// counters are NOT shared across instances. This throttle is therefore a
// best-effort, opportunistic guard against a single hot client hitting one
// instance — it is NOT real DDoS protection. The authoritative layer is
// Vercel Firewall / Attack Challenge Mode (and, if needed, a distributed
// limiter such as Upstash Redis). See the security review for the full plan.
export function proxy(request: NextRequest) {
  // Generous threshold to avoid false positives for normal browsing,
  // RSC prefetches, and shared/NAT'd office IPs, while still capping a flood.
  const blocked = rateLimit(request, {
    key: "global",
    limit: 120,
    windowSeconds: 10,
  });
  if (blocked) return blocked;

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except static assets and metadata files, which are
    // CDN-cached and cheap to serve, so throttling them only hurts legit users.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
