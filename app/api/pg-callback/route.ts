import { NextRequest, NextResponse } from 'next/server'
import { getSoldTicketsCollection, getTicketsCollection } from '@/lib/mongodb'
import { getOrderDetails } from '@/lib/pgClient'
import { enqueueTicketEmail, processTicketEmailJobs } from '@/lib/message-broker'
import { isJokerTicketName, upsertJokerTicket } from '@/lib/sold-tickets'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  
  const id = searchParams.get('ID') || searchParams.get('id')
  const status = searchParams.get('STATUS') || searchParams.get('status')

  console.log(' PG Callback received:', { id, status })

  if (!id) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=invalid_callback`
    )
  }

  try {
    const soldTicketsCollection = await getSoldTicketsCollection()
    const ticketsCollection = await getTicketsCollection()
    
    const ticket = await soldTicketsCollection.findOne({ pgOrderId: parseInt(id) })

    if (!ticket) {
      console.log(' Ticket not found for pgOrderId:', id)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=ticket_not_found`
      )
    }

    const orderDetails = await getOrderDetails(parseInt(id), ticket.pgPassword)
    console.log(' Order details:', orderDetails)

    const isPaid =
      orderDetails.order?.status === 'Paid' ||
      orderDetails.order?.status === 'Completed' ||
      orderDetails.order?.status === 'FullyPaid' ||
      status === 'FullyPaid' ||
      status === 'Paid'

    console.log(' isPaid:', isPaid, '| DB status:', ticket.status)

    if (isPaid && ticket.status === 'pending') {
      const paidAt = new Date()

      await soldTicketsCollection.updateOne(
        { id: ticket.id },
        { $set: { status: 'paid', paidAt } }
      )

      await ticketsCollection.updateOne(
        ticket.originalTicketObjectId
          ? { _id: ticket.originalTicketObjectId }
          : { id: ticket.originalTicketId },
        [
          {
            $set: {
              quantity: { $max: [{ $subtract: ["$quantity", 1] }, 0] },
              updatedAt: paidAt.toISOString(),
            },
          },
          {
            $set: {
              status: {
                $cond: [{ $lte: ["$quantity", 0] }, "sold_out", "$status"],
              },
            },
          },
        ]
      )

      const paidTicket = {
        ...ticket,
        status: 'paid',
        paidAt,
      }

      if (isJokerTicketName(ticket.eventName)) {
        await upsertJokerTicket(paidTicket)
      }

      await enqueueTicketEmail({
        ticketId: ticket.id,
        email: ticket.email,
        name: ticket.name,
        surname: ticket.surname,
        personalNumber: ticket.personalNumber,
        eventName: ticket.eventName || 'Event',
        eventDate: ticket.eventDate || new Date(),
        amount: ticket.amount,
        currency: 'GEL',
        qrCodeDataUrl: ticket.qrCode,
      })

      const brokerResult = await processTicketEmailJobs()
      console.log(' Email broker result:', brokerResult)

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/success?ticketId=${ticket.id}`
      )
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fail?orderId=${id}`
    )

  } catch (error) {
    console.error(' Callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=server_error`
    )
  }
}
