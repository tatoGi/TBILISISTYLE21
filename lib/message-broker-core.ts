export type TicketEmailPayload = {
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

export type MessageJob = {
  _id: string;
  type: "ticket-email";
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  payload: TicketEmailPayload;
};

export type MessageJobsCollection = {
  findOneAndUpdate: (...args: unknown[]) => Promise<MessageJob | null>;
  updateOne: (...args: unknown[]) => Promise<unknown>;
};

export type TicketEmailProcessorDeps = {
  generateTicketPDF: (data: {
    id: string;
    name: string;
    surname: string;
    personalNumber: string;
    eventName: string;
    eventDate: Date | string;
    amount: number;
    currency: string;
    qrCodeDataUrl: string;
  }) => Promise<Buffer>;
  sendTicketEmail: (
    to: string,
    name: string,
    pdfBuffer: Buffer,
    ticketId: string,
    eventName?: string
  ) => Promise<void>;
};

export const maxTicketEmailAttempts = 5;

export async function processTicketEmailJobsWithDeps(
  collection: MessageJobsCollection,
  deps: TicketEmailProcessorDeps,
  limit = 5
) {
  let sent = 0;
  let failed = 0;

  for (let index = 0; index < limit; index += 1) {
    const job = await collection.findOneAndUpdate(
      {
        type: "ticket-email",
        status: { $in: ["pending", "failed"] },
        attempts: { $lt: maxTicketEmailAttempts },
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
    );

    if (!job) {
      break;
    }

    try {
      const pdfBuffer = await deps.generateTicketPDF({
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

      await deps.sendTicketEmail(
        job.payload.email,
        job.payload.name,
        pdfBuffer,
        job.payload.ticketId,
        job.payload.eventName
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
            status:
              job.attempts >= maxTicketEmailAttempts ? "failed" : "pending",
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
