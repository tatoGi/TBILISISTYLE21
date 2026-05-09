import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const adminCookieName = "ts21_admin";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

function getSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword());
}

export function createAdminToken() {
  const secret = getSecret();

  if (!secret) {
    return "";
  }

  return createHmac("sha256", secret).update("admin").digest("hex");
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();

  if (!expected) {
    return false;
  }

  return password === expected;
}

export function verifyAdminToken(token: string | undefined) {
  const expected = createAdminToken();

  if (!token || !expected || token.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function isAdminSession() {
  const store = await cookies();
  return verifyAdminToken(store.get(adminCookieName)?.value);
}

export function isAdminRequest(request: NextRequest) {
  const headerKey = request.headers.get("x-admin-key");

  if (headerKey && verifyAdminPassword(headerKey)) {
    return true;
  }

  return verifyAdminToken(request.cookies.get(adminCookieName)?.value);
}
