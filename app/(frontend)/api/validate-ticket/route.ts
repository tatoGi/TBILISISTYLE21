import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { getPayloadClient, getPgPool } from '@/lib/payload'

type TicketQrPayload = {
  ticketId?: unknown
  personalNumber?: unknown
  eventId?: unknown
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let qrData: unknown

  try {
    const body = await req.json()
    qrData = body.qrData
  } catch {
    return NextResponse.json({ valid: false, error: 'Invalid request.' }, { status: 400 })
  }

  if (!qrData || typeof qrData !== 'string') {
    return NextResponse.json({ valid: false, error: 'Invalid QR data.' }, { status: 400 })
  }

  let parsedData: TicketQrPayload

  try {
    parsedData = JSON.parse(qrData)
  } catch {
    return NextResponse.json({ valid: false, error: 'Invalid QR code.' }, { status: 400 })
  }

  const { ticketId, personalNumber, eventId } = parsedData

  if (typeof ticketId !== 'string' || typeof personalNumber !== 'string') {
    return NextResponse.json({ valid: false, error: 'Ticket data is missing from the QR code.' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  const ticket = await payload
    .findByID({ collection: 'soldTickets', id: ticketId, depth: 0 })
    .catch(() => null)

  const matches =
    ticket &&
    ticket.personalNumber === personalNumber &&
    (typeof eventId !== 'string' || ticket.originalTicketId === eventId)

  if (!ticket || !matches) {
    return NextResponse.json({ valid: false, error: 'Ticket was not found in the database.' }, { status: 404 })
  }

  if (ticket.status !== 'paid') {
    return NextResponse.json({
      valid: false,
      error: ticket.status === 'pending' ? 'Payment is not completed.' : 'Ticket is cancelled.',
    })
  }

  if (ticket.scannedAt) {
    return NextResponse.json({
      valid: false,
      error: 'Ticket has already been used.',
      scannedAt: ticket.scannedAt,
    })
  }

  // Atomically claim the scan so a ticket can't be admitted twice.
  const pool = await getPgPool()
  const scan = await pool.query(
    `UPDATE sold_tickets SET scanned_at = now(), scanned_by = 'admin'
     WHERE id = $1 AND scanned_at IS NULL
     RETURNING id`,
    [ticket.id]
  )

  if (scan.rowCount !== 1) {
    return NextResponse.json({
      valid: false,
      error: 'Ticket has already been used.',
    })
  }

  return NextResponse.json({
    valid: true,
    ticket: {
      id: ticket.id,
      name: ticket.name,
      surname: ticket.surname,
      personalNumber: ticket.personalNumber,
      eventName: ticket.eventName,
      eventDate: ticket.eventDate,
      amount: ticket.amount,
      paidAt: ticket.paidAt,
    },
  })
}
