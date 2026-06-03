import { generateTicketPDF } from "@/lib/pdf";
import { sendTicketEmail } from "@/lib/email";
import { getPayloadClient } from "@/lib/payload";
import {
  maxTicketEmailAttempts,
  type MessageJob,
  type MessageJobsCollection,
  processTicketEmailJobsWithDeps,
  type TicketEmailPayload,
} from "@/lib/message-broker-core";

const TICKET_EMAIL = "ticket-email";

export async function enqueueTicketEmail(payload: TicketEmailPayload) {
  const client = await getPayloadClient();
  const now = new Date().toISOString();

  const existing = await client.find({
    collection: "messageJobs",
    where: {
      and: [{ type: { equals: TICKET_EMAIL } }, { ticketId: { equals: payload.ticketId } }],
    },
    limit: 1,
    pagination: false,
    depth: 0,
  });

  if (existing.docs.length > 0) {
    // Mirror Mongo $set on an existing job: refresh metadata, keep status/attempts.
    await client.update({
      collection: "messageJobs",
      id: existing.docs[0].id,
      data: { updatedAt: now, lastError: null },
    });
    return;
  }

  await client.create({
    collection: "messageJobs",
    data: {
      type: TICKET_EMAIL,
      payload,
      ticketId: payload.ticketId,
      email: payload.email,
      subject: `Your ticket — ${payload.eventName}`,
      attempts: 0,
      status: "pending",
      createdAt: now,
    },
  });
}

/**
 * Adapts the Payload Local API to the Mongo-collection shape that the pure
 * processor in message-broker-core expects (findOneAndUpdate / updateOne).
 * Keeping the core untouched preserves its unit tests.
 */
function buildJobsCollection(
  client: Awaited<ReturnType<typeof getPayloadClient>>
): MessageJobsCollection {
  return {
    async findOneAndUpdate() {
      const found = await client.find({
        collection: "messageJobs",
        where: {
          and: [
            { type: { equals: TICKET_EMAIL } },
            { status: { in: ["pending", "failed"] } },
            { attempts: { less_than: maxTicketEmailAttempts } },
          ],
        },
        sort: "createdAt",
        limit: 1,
        pagination: false,
        depth: 0,
      });

      const doc = found.docs[0];
      if (!doc) return null;

      const attempts = Number(doc.attempts ?? 0) + 1;
      await client.update({
        collection: "messageJobs",
        id: doc.id,
        data: { status: "processing", attempts, updatedAt: new Date().toISOString() },
      });

      return {
        _id: String(doc.id),
        type: TICKET_EMAIL,
        status: "processing",
        attempts,
        payload: (doc as { payload?: unknown }).payload as unknown as TicketEmailPayload,
      } satisfies MessageJob;
    },

    async updateOne(filter: unknown, update: unknown) {
      const id = (filter as { _id: string })._id;
      const set = (update as { $set: Record<string, unknown> }).$set ?? {};
      await client.update({ collection: "messageJobs", id, data: set });
      return { modifiedCount: 1 };
    },
  };
}

export async function processTicketEmailJobs(limit = 5) {
  const client = await getPayloadClient();
  return processTicketEmailJobsWithDeps(
    buildJobsCollection(client),
    { generateTicketPDF, sendTicketEmail },
    limit
  );
}
