import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

type PurchaseInput = {
  quantity: number;
  email: string;
  name: string;
  phone: string;
};

function validatePurchaseInput(input: Record<string, unknown>): PurchaseInput {
  const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));
  const email = String(input.email || "").trim();
  const name = String(input.name || "").trim();
  const phone = String(input.phone || "").trim();

  if (!email || !name || !phone) {
    throw new Error("All fields are required");
  }

  if (!email.includes("@")) {
    throw new Error("Invalid email address");
  }

  return { quantity, email, name, phone };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const purchaseData = validatePurchaseInput(body);
    
    const db = await getDb();
    const ticketsCollection = db.collection("tickets");
    const purchasesCollection = db.collection("purchases");

    // Get the ticket
    const ticket = await ticketsCollection.findOne({ _id: new ObjectId(id) });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status === "sold_out" || ticket.quantity < purchaseData.quantity) {
      return NextResponse.json({ error: "Not enough tickets available" }, { status: 400 });
    }

    // Create purchase record
    const now = new Date().toISOString();
    const purchase = {
      ticketId: id,
      ...purchaseData,
      totalPrice: ticket.priceGel * purchaseData.quantity,
      status: "pending", // pending, paid, cancelled
      createdAt: now,
      updatedAt: now,
    };

    const result = await purchasesCollection.insertOne(purchase);

    // Update ticket quantity
    await ticketsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { quantity: -purchaseData.quantity },
        $set: { 
          status: ticket.quantity - purchaseData.quantity <= 0 ? "sold_out" : ticket.status,
          updatedAt: now 
        }
      }
    );

    return NextResponse.json({ 
      success: true, 
      purchaseId: result.insertedId.toString(),
      message: "Purchase initiated. Please complete payment." 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Purchase failed" },
      { status: 400 }
    );
  }
}