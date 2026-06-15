import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export const adminCookieName = "ts21_admin";
const tokenTtlSeconds = 60 * 60 * 8;

type AdminJwtPayload = {
  sub: "admin";
  role: "admin";
  iat: number;
  exp: number;
};

/**
 * Returns the bcrypt hash of the admin password.
 * Set ADMIN_PASSWORD_HASH in your environment to a bcrypt hash, e.g.:
 *   node -e "import('bcryptjs').then(b=>b.hash('yourpass',12).then(console.log))"
 */
function getAdminPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH;
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET environment variable is required for JWT signing. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    );
  }
  return secret;
}

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
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

export function isAdminConfigured() {
  return Boolean(getAdminPasswordHash());
}

export function createAdminToken() {
  const secret = getSecret();

  if (!secret) {
    return "";
  }

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const payload: AdminJwtPayload = {
    sub: "admin",
    role: "admin",
    iat: now,
    exp: now + tokenTtlSeconds,
  };
  const unsignedToken = [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
  ].join(".");

  return `${unsignedToken}.${sign(unsignedToken, secret)}`;
}

export async function verifyAdminPassword(password: string) {
  const hash = getAdminPasswordHash();

  if (!hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}

export function verifyAdminToken(token: string | undefined) {
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
  const expectedSignature = sign(unsignedToken, secret);

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as {
      alg?: unknown;
      typ?: unknown;
    };
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminJwtPayload>;
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

export async function isAdminSession() {
  const store = await cookies();
  return verifyAdminToken(store.get(adminCookieName)?.value);
}

export function isAdminRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : undefined;

  if (verifyAdminToken(bearerToken)) {
    return true;
  }

  return verifyAdminToken(request.cookies.get(adminCookieName)?.value);
}

export function getAdminTokenMaxAge() {
  return tokenTtlSeconds;
}
