import assert from "node:assert/strict";
import test from "node:test";
import { isJokerTicketName, serializeSoldTicket } from "../lib/ticket-utils.ts";

test("isJokerTicketName detects Joker ticket names case-insensitively", () => {
  assert.equal(isJokerTicketName("Joker Ticket"), true);
  assert.equal(isJokerTicketName("vip joker access"), true);
  assert.equal(isJokerTicketName("Main Stage"), false);
  assert.equal(isJokerTicketName(null), false);
});

test("serializeSoldTicket maps only the sold ticket fields used by admin views", () => {
  const paidAt = new Date("2026-05-25T10:00:00.000Z");
  const ticket = serializeSoldTicket({
    id: "ABC123",
    personalNumber: "01010101010",
    email: "buyer@example.com",
    name: "Ana",
    surname: "Test",
    amount: 120,
    status: "paid",
    originalTicketId: "catalog-ticket-id",
    eventName: "Joker Ticket",
    eventDate: "2026-06-01",
    location: "Tbilisi",
    paidAt,
    scannedAt: undefined,
    createdAt: "2026-05-25T09:50:00.000Z",
    ignoredField: "not included",
  });

  assert.deepEqual(ticket, {
    id: "ABC123",
    personalNumber: "01010101010",
    email: "buyer@example.com",
    name: "Ana",
    surname: "Test",
    amount: 120,
    status: "paid",
    originalTicketId: "catalog-ticket-id",
    eventName: "Joker Ticket",
    eventDate: "2026-06-01",
    location: "Tbilisi",
    paidAt,
    scannedAt: undefined,
    createdAt: "2026-05-25T09:50:00.000Z",
  });
});
