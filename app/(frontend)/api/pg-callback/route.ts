import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient, getPgPool } from '@/lib/payload'
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
    const payload = await getPayloadClient()

    const found = await payload.find({
      collection: 'soldTickets',
      where: { pgOrderId: { equals: parseInt(id) } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    const ticket = found.docs[0]

    if (!ticket) {
      console.log(' Ticket not found for pgOrderId:', id)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=ticket_not_found`
      )
    }

    const orderDetails = await getOrderDetails(parseInt(id), ticket.pgPassword as string)
    console.log(' Order details:', orderDetails)

    const isPaid =
      orderDetails.order?.status === 'Paid' ||
      orderDetails.order?.status === 'Completed' ||
      orderDetails.order?.status === 'FullyPaid' ||
      status === 'FullyPaid' ||
      status === 'Paid'

    console.log(' isPaid:', isPaid, '| DB status:', ticket.status)

    if (isPaid && ticket.status === 'pending') {
      const paidAt = new Date().toISOString()
      const pool = await getPgPool()

      // Atomically decrement inventory, only if the ticket is still on sale.
      const dec = await pool.query(
        `UPDATE tickets SET quantity = quantity - 1, updated_at = now()
         WHERE id = $1 AND status = 'active' AND quantity > 0
         RETURNING quantity`,
        [ticket.originalTicketId]
      )

      if (dec.rowCount !== 1) {
        await payload.update({
          collection: 'soldTickets',
          id: ticket.id as string,
          data: { status: 'failed', failedAt: paidAt, failReason: 'sold_out' },
        })

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=sold_out`
        )
      }

      // Flip to sold_out once the last unit is gone.
      if (Number(dec.rows[0].quantity) <= 0) {
        await pool.query(`UPDATE tickets SET status = 'sold_out' WHERE id = $1`, [
          ticket.originalTicketId,
        ])
      }

      await payload.update({
        collection: 'soldTickets',
        id: ticket.id as string,
        data: { status: 'paid', paidAt },
      })

      const paidTicket = { ...ticket, status: 'paid', paidAt }

      if (isJokerTicketName(ticket.eventName)) {
        await upsertJokerTicket(paidTicket as unknown as Record<string, unknown>)
      }

      await enqueueTicketEmail({
        ticketId: ticket.id as string,
        email: ticket.email as string,
        name: ticket.name as string,
        surname: ticket.surname as string,
        personalNumber: ticket.personalNumber as string,
        eventName: (ticket.eventName as string) || 'Event',
        eventDate: (ticket.eventDate as string) || new Date().toISOString(),
        amount: ticket.amount as number,
        currency: 'GEL',
        qrCodeDataUrl: ticket.qrCode as string,
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
