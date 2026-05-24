import { NextRequest, NextResponse } from 'next/server'
import { getSoldTicketsCollection } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  const { personalNumber } = await req.json()

  const soldTicketsCollection = await getSoldTicketsCollection()
  
  const paidTicketsCount = await soldTicketsCollection.countDocuments({
    personalNumber: personalNumber,
    status: 'paid',
  })

  return NextResponse.json({
    allowed: paidTicketsCount < 3,
    remainingTickets: 3 - paidTicketsCount,
    paidTickets: paidTicketsCount,
    maxTickets: 3,
  })
}
