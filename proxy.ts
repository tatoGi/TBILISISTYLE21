import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

const adminCookieName = "ts21_admin";

function getSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(input: string, secret: string) {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function verifyAdminToken(token: string | undefined) {
  const secret = getSecret();

  if (!token || !secret) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  if (!safeEqual(signature, sign(unsignedToken, secret))) {
    return false;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as {
      alg?: unknown;
      typ?: unknown;
    };
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as {
      exp?: unknown;
      role?: unknown;
      sub?: unknown;
    };
    const now = Math.floor(Date.now() / 1000);

    return (
      header.alg === "HS256" &&
      header.typ === "JWT" &&
      payload.sub === "admin" &&
      payload.role === "admin" &&
      typeof payload.exp === "number" &&
      payload.exp > now
    );
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  if (verifyAdminToken(request.cookies.get(adminCookieName)?.value)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin-login";
  url.searchParams.set("error", "session");

  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/admin/:path*",
};
