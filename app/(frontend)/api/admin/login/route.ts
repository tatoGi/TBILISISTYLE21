import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieName,
  createAdminToken,
  getAdminTokenMaxAge,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const blocked = rateLimit(request, { key: "admin-login", limit: 5, windowSeconds: 300 });
  if (blocked) return blocked;

  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = createAdminToken();

  // Only set the token in an httpOnly cookie — never expose it in the response body.
  const response = NextResponse.json({
    success: true,
    expiresIn: getAdminTokenMaxAge(),
  });

  response.cookies.set(adminCookieName, token, {
    httpOnly: true,
    maxAge: getAdminTokenMaxAge(),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
