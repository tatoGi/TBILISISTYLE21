import { NextRequest, NextResponse } from 'next/server'
import { getTicketsCollection } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  const { qrData } = await req.json()

  if (!qrData) {
    return NextResponse.json({ error: 'QR მონაცემები არასწორია' }, { status: 400 })
  }

  let parsedData
  try {
    parsedData = JSON.parse(qrData)
  } catch {
    return NextResponse.json({ error: 'QR კოდი არასწორია' }, { status: 400 })
  }

  const { ticketId, personalNumber } = parsedData

  const ticketsCollection = await getTicketsCollection()
  const ticket = await ticketsCollection.findOne({ id: ticketId })

  if (!ticket) {
    return NextResponse.json({ valid: false, error: 'ბილეთი არ მოიძებნა' }, { status: 404 })
  }

  if (ticket.status !== 'paid') {
    return NextResponse.json({ 
      valid: false, 
      error: ticket.status === 'pending' ? 'გადახდა დასრულებული არ არის' : 'ბილეთი გაუქმებულია' 
    })
  }

  // Check if already scanned (add scanned flag if needed)
  const isScanned = ticket.scannedAt ? true : false
  
  if (isScanned) {
    return NextResponse.json({ 
      valid: false, 
      error: 'ბილეთი უკვე გამოყენებულია',
      scannedAt: ticket.scannedAt 
    })
  }

  // Mark as scanned
  await ticketsCollection.updateOne(
    { id: ticket.id },
    { $set: { scannedAt: new Date(), scannedBy: 'admin' } }
  )

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