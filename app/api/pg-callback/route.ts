import { NextRequest, NextResponse } from 'next/server'
import { getTicketsCollection } from '@/lib/mongodb'
import { getOrderDetails } from '@/lib/pgClient'
import { generateTicketPDF } from '@/lib/pdf'
import { sendTicketEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  
  const id = searchParams.get('ID') || searchParams.get('id')
  const status = searchParams.get('STATUS') || searchParams.get('status')

  console.log('📥 PG Callback received:', { id, status })

  if (!id) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=invalid_callback`
    )
  }

  try {
    const ticketsCollection = await getTicketsCollection()
    
    // 👇 password DB-დან ამოიღე
    const ticket = await ticketsCollection.findOne({ pgOrderId: parseInt(id) })

    if (!ticket) {
      console.log('❌ Ticket not found for pgOrderId:', id)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=ticket_not_found`
      )
    }

    // 👇 DB-ში შენახული password გამოიყენე
    const orderDetails = await getOrderDetails(parseInt(id), ticket.pgPassword)
    console.log('📋 Order details:', orderDetails)

    const isPaid =
      orderDetails.order?.status === 'Paid' ||
      orderDetails.order?.status === 'Completed' ||
      orderDetails.order?.status === 'FullyPaid' ||
      status === 'FullyPaid' ||
      status === 'Paid'

    console.log('💰 isPaid:', isPaid, '| DB status:', ticket.status)

    if (isPaid && ticket.status === 'pending') {
      await ticketsCollection.updateOne(
        { id: ticket.id },
        { $set: { status: 'paid', paidAt: new Date() } }
      )

      try {
        const pdfBuffer = await generateTicketPDF({
          id: ticket.id,
          name: ticket.name,
          surname: ticket.surname,
          personalNumber: ticket.personalNumber,
          eventName: ticket.eventName || 'Event',
          eventDate: ticket.eventDate || new Date(),
          amount: ticket.amount,
          currency: 'GEL',
          qrCodeDataUrl: ticket.qrCode,
        })

        await sendTicketEmail(ticket.email, ticket.name, pdfBuffer, ticket.id)
        console.log('📧 Email sent to:', ticket.email)
      } catch (emailError) {
        console.error('❌ Email error:', emailError)
      }

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/success?ticketId=${ticket.id}`
      )
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fail?orderId=${id}`
    )

  } catch (error) {
    console.error('❌ Callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=server_error`
    )
  }
}