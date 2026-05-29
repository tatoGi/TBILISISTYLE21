import { NextRequest, NextResponse } from 'next/server'
import { getSoldTicketsCollection } from '@/lib/mongodb'

const MAX_TICKETS_PER_PERSON = 3

export async function POST(req: NextRequest) {
  let personalNumber: unknown
  try {
    const body = await req.json()
    personalNumber = body.personalNumber
  } catch {
    return NextResponse.json(
      { allowed: false, error: 'Invalid request body.' },
      { status: 400 }
    )
  }

  // Server-side guard — client may be bypassed
  if (typeof personalNumber !== 'string' || !/^\d{11}$/.test(personalNumber)) {
    return NextResponse.json(
      { allowed: false, error: 'Personal number must be exactly 11 digits.' },
      { status: 400 }
    )
  }

  const soldTicketsCollection = await getSoldTicketsCollection()
  const paidTicketsCount = await soldTicketsCollection.countDocuments({
    personalNumber,
    status: 'paid',
  })

  return NextResponse.json({
    allowed: paidTicketsCount < MAX_TICKETS_PER_PERSON,
    remainingTickets: Math.max(0, MAX_TICKETS_PER_PERSON - paidTicketsCount),
    paidTickets: paidTicketsCount,
    maxTickets: MAX_TICKETS_PER_PERSON,
  })
}
