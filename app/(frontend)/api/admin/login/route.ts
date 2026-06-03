import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieName,
  createAdminToken,
  getAdminTokenMaxAge,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    password?: unknown;
  } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = createAdminToken();
  const response = NextResponse.json({
    token,
    tokenType: "Bearer",
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
