import { generateTicketPDF } from "@/lib/pdf";
import { sendTicketEmail } from "@/lib/email";
import { getMessageJobsCollection } from "@/lib/mongodb";
import {
  type MessageJobsCollection,
  processTicketEmailJobsWithDeps,
  type TicketEmailPayload,
} from "@/lib/message-broker-core";

export async function enqueueTicketEmail(payload: TicketEmailPayload) {
  const collection = await getMessageJobsCollection();
  const now = new Date();

  await collection.updateOne(
    { type: "ticket-email", "payload.ticketId": payload.ticketId },
    {
      $setOnInsert: {
        type: "ticket-email",
        payload,
        attempts: 0,
        status: "pending",
        createdAt: now,
      },
      $set: {
        updatedAt: now,
        lastError: null,
      },
    },
    { upsert: true }
  );
}

export async function processTicketEmailJobs(limit = 5) {
  const collection = await getMessageJobsCollection();
  return processTicketEmailJobsWithDeps(
    collection as unknown as MessageJobsCollection,
    { generateTicketPDF, sendTicketEmail },
    limit
  );
}
