import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createTicket,
  listTickets,
  validateTicketInput,
} from "@/lib/tickets";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const admin = isAdminRequest(request);
  const tickets = await listTickets({ publicOnly: !admin });

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const id = await createTicket(validateTicketInput(body));
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid ticket" },
      { status: 400 }
    );
  }
}
