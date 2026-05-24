import { generateTicketPDF } from "@/lib/pdf";
import { sendTicketEmail } from "@/lib/email";
import { getMessageJobsCollection } from "@/lib/mongodb";
import type { ObjectId } from "mongodb";

type TicketEmailPayload = {
  ticketId: string;
  email: string;
  name: string;
  surname: string;
  personalNumber: string;
  eventName: string;
  eventDate: Date | string;
  amount: number;
  currency: string;
  qrCodeDataUrl: string;
};

type MessageJob = {
  _id: ObjectId;
  type: "ticket-email";
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  payload: TicketEmailPayload;
};

const maxAttempts = 5;

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
  let sent = 0;
  let failed = 0;

  for (let index = 0; index < limit; index += 1) {
    const job = (await collection.findOneAndUpdate(
      {
        type: "ticket-email",
        status: { $in: ["pending", "failed"] },
        attempts: { $lt: maxAttempts },
      },
      {
        $set: {
          status: "processing",
          updatedAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
      {
        sort: { createdAt: 1 },
        returnDocument: "after",
      }
    )) as MessageJob | null;

    if (!job) {
      break;
    }

    try {
      const pdfBuffer = await generateTicketPDF({
        id: job.payload.ticketId,
        name: job.payload.name,
        surname: job.payload.surname,
        personalNumber: job.payload.personalNumber,
        eventName: job.payload.eventName,
        eventDate: job.payload.eventDate,
        amount: job.payload.amount,
        currency: job.payload.currency,
        qrCodeDataUrl: job.payload.qrCodeDataUrl,
      });

      await sendTicketEmail(
        job.payload.email,
        job.payload.name,
        pdfBuffer,
        job.payload.ticketId
      );

      await collection.updateOne(
        { _id: job._id },
        {
          $set: {
            status: "sent",
            sentAt: new Date(),
            updatedAt: new Date(),
            lastError: null,
          },
        }
      );
      sent += 1;
    } catch (error) {
      const lastError = error instanceof Error ? error.message : "Unknown error";

      await collection.updateOne(
        { _id: job._id },
        {
          $set: {
            status: job.attempts >= maxAttempts ? "failed" : "pending",
            lastError,
            updatedAt: new Date(),
          },
        }
      );
      failed += 1;
    }
  }

  return { sent, failed };
}
