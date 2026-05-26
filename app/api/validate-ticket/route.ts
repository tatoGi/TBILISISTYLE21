import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { getSoldTicketsCollection } from '@/lib/mongodb'

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

  const soldTicketsCollection = await getSoldTicketsCollection()
  const ticket = await soldTicketsCollection.findOne({
    id: ticketId,
    personalNumber,
    ...(typeof eventId === 'string' ? { originalTicketId: eventId } : {}),
  })

  if (!ticket) {
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

  const scanResult = await soldTicketsCollection.updateOne(
    { id: ticket.id, scannedAt: { $exists: false } },
    { $set: { scannedAt: new Date(), scannedBy: 'admin' } }
  )

  if (scanResult.modifiedCount !== 1) {
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
