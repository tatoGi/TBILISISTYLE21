import assert from "node:assert/strict";
import test from "node:test";
import {
  maxTicketEmailAttempts,
  processTicketEmailJobsWithDeps,
  type MessageJob,
} from "../lib/message-broker-core.ts";

function createJob(overrides: Partial<MessageJob> = {}): MessageJob {
  return {
    _id: "job-1",
    type: "ticket-email",
    status: "pending",
    attempts: 1,
    payload: {
      ticketId: "TICKET1",
      email: "buyer@example.com",
      name: "Ana",
      surname: "Test",
      personalNumber: "01010101010",
      eventName: "Main Stage",
      eventDate: "2026-06-01",
      amount: 100,
      currency: "GEL",
      qrCodeDataUrl: "data:image/png;base64,abc",
    },
    ...overrides,
  };
}

function createCollection(jobs: MessageJob[]) {
  const claims: unknown[][] = [];
  const updates: unknown[][] = [];

  return {
    claims,
    updates,
    async findOneAndUpdate(...args: unknown[]) {
      claims.push(args);
      return jobs.shift() ?? null;
    },
    async updateOne(...args: unknown[]) {
      updates.push(args);
      return { modifiedCount: 1 };
    },
  };
}

test("processTicketEmailJobsWithDeps sends pending ticket email jobs", async () => {
  const collection = createCollection([createJob()]);
  const pdfBuffer = Buffer.from("pdf");
  const calls: string[] = [];

  const result = await processTicketEmailJobsWithDeps(collection, {
    async generateTicketPDF(data) {
      calls.push(`pdf:${data.id}`);
      return pdfBuffer;
    },
    async sendTicketEmail(to, name, buffer, ticketId) {
      calls.push(`email:${to}:${name}:${ticketId}:${buffer.toString()}`);
    },
  });

  assert.deepEqual(result, { sent: 1, failed: 0 });
  assert.deepEqual(calls, [
    "pdf:TICKET1",
    "email:buyer@example.com:Ana:TICKET1:pdf",
  ]);

  const sentUpdate = collection.updates.at(-1) as unknown[];
  assert.deepEqual(sentUpdate[0], { _id: "job-1" });
  assert.equal((sentUpdate[1] as { $set: { status: string } }).$set.status, "sent");
});

test("processTicketEmailJobsWithDeps puts failed jobs back to pending before max attempts", async () => {
  const collection = createCollection([createJob({ attempts: 2 })]);

  const result = await processTicketEmailJobsWithDeps(collection, {
    async generateTicketPDF() {
      throw new Error("PDF failed");
    },
    async sendTicketEmail() {
      assert.fail("email should not be sent when PDF generation fails");
    },
  });

  assert.deepEqual(result, { sent: 0, failed: 1 });

  const failedUpdate = collection.updates.at(-1) as unknown[];
  const set = (failedUpdate[1] as { $set: { status: string; lastError: string } })
    .$set;
  assert.equal(set.status, "pending");
  assert.equal(set.lastError, "PDF failed");
});

test("processTicketEmailJobsWithDeps marks jobs failed at max attempts", async () => {
  const collection = createCollection([
    createJob({ attempts: maxTicketEmailAttempts }),
  ]);

  const result = await processTicketEmailJobsWithDeps(collection, {
    async generateTicketPDF() {
      return Buffer.from("pdf");
    },
    async sendTicketEmail() {
      throw new Error("SMTP failed");
    },
  });

  assert.deepEqual(result, { sent: 0, failed: 1 });

  const failedUpdate = collection.updates.at(-1) as unknown[];
  const set = (failedUpdate[1] as { $set: { status: string; lastError: string } })
    .$set;
  assert.equal(set.status, "failed");
  assert.equal(set.lastError, "SMTP failed");
});
