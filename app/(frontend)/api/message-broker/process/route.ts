import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { processTicketEmailJobs } from "@/lib/message-broker";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

async function handleProcess(req: NextRequest) {
  const blocked = rateLimit(req, { key: "broker-process", limit: 10, windowSeconds: 60 });
  if (blocked) return blocked;

  const brokerSecret = process.env.MESSAGE_BROKER_SECRET;

  if (!brokerSecret) {
    console.error("MESSAGE_BROKER_SECRET is not configured — refusing request.");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const requestSecret = req.headers.get("x-broker-secret") || "";

  if (
    requestSecret.length !== brokerSecret.length ||
    !timingSafeEqual(Buffer.from(requestSecret), Buffer.from(brokerSecret))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await processTicketEmailJobs();
  return NextResponse.json({ success: true, ...result });
}

export async function GET(req: NextRequest) {
  return handleProcess(req);
}

export async function POST(req: NextRequest) {
  return handleProcess(req);
}
