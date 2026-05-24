import { NextRequest, NextResponse } from "next/server";
import { processTicketEmailJobs } from "@/lib/message-broker";

export const runtime = "nodejs";

async function handleProcess(req: NextRequest) {
  const brokerSecret = process.env.MESSAGE_BROKER_SECRET;

  if (brokerSecret) {
    const requestSecret = req.headers.get("x-broker-secret");

    if (requestSecret !== brokerSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
