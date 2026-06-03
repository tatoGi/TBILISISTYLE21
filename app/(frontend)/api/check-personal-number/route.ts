import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

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

  const payload = await getPayloadClient()
  const paid = await payload.count({
    collection: 'soldTickets',
    where: {
      and: [
        { personalNumber: { equals: personalNumber } },
        { status: { equals: 'paid' } },
      ],
    },
  })
  const paidTicketsCount = paid.totalDocs

  return NextResponse.json({
    allowed: paidTicketsCount < MAX_TICKETS_PER_PERSON,
    remainingTickets: Math.max(0, MAX_TICKETS_PER_PERSON - paidTicketsCount),
    paidTickets: paidTicketsCount,
    maxTickets: MAX_TICKETS_PER_PERSON,
  })
}
