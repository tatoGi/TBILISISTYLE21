// app/api/pg-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getTicketsCollection } from '@/lib/mongodb'  // მხოლოდ tickets
import { getOrderDetails } from '@/lib/pgClient'
import { generateTicketPDF } from '@/lib/pdf'
import { sendTicketEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')
  const password = searchParams.get('password')

  if (!id || !password) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/buy?error=invalid_callback`
    )
  }

  // Get order details from PG
  const orderDetails = await getOrderDetails(parseInt(id), password)
  console.log('📥 Order details:', orderDetails)

  const ticketsCollection = await getTicketsCollection()

  // Find ticket in MongoDB
  const ticket = await ticketsCollection.findOne({ pgOrderId: parseInt(id) })

  if (!ticket) {
    console.log('❌ Ticket not found for pgOrderId:', id)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/buy?error=ticket_not_found`
    )
  }

  // Check payment status
  const isPaid =
    orderDetails.order?.status === 'Paid' ||
    orderDetails.order?.status === 'Completed'

  console.log('💰 Payment status:', isPaid ? 'Paid' : 'Not paid', orderDetails.order?.status)

  if (isPaid && ticket.status === 'pending') {
    // Update ticket status
    await ticketsCollection.updateOne(
      { id: ticket.id },
      { $set: { status: 'paid', paidAt: new Date() } }
    )
    console.log('✅ Ticket status updated to paid')

    // Generate PDF
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

    // Send email
    await sendTicketEmail(ticket.email, ticket.name, pdfBuffer, ticket.id)
    console.log('📧 Email sent to:', ticket.email)
  }

  // Redirect to success page
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/success?ticketId=${ticket.id}`
  )
}