import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { createOrder as callPGOrder } from '@/lib/pgClient'
import { generateQRCode, generateTicketQRData } from '@/lib/qr'
import { v4 as uuidv4 } from 'uuid'

function toDate(value: unknown): string | null {
  if (!value) return null
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

export async function POST(req: NextRequest) {
  try {
    console.log('API called: /api/create-order')

    const body = await req.json()
    const { name, surname, personalNumber, email, ticketId } = body

    // Server-side guards — clients may bypass UI validation
    if (typeof name !== 'string' || !/^[A-Za-z\s]{2,}$/.test(name.trim())) {
      return NextResponse.json(
        { error: 'Name must contain Latin letters only (as written on your ID).' },
        { status: 400 }
      )
    }
    if (typeof surname !== 'string' || !/^[A-Za-z\s]{2,}$/.test(surname.trim())) {
      return NextResponse.json(
        { error: 'Surname must contain Latin letters only (as written on your ID).' },
        { status: 400 }
      )
    }
    if (typeof personalNumber !== 'string' || !/^\d{11}$/.test(personalNumber)) {
      return NextResponse.json(
        { error: 'Personal number must be exactly 11 digits.' },
        { status: 400 }
      )
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }
    if (typeof ticketId !== 'string' || !ticketId.trim()) {
      return NextResponse.json(
        { error: 'Missing ticket selection.' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    const paidTickets = await payload.count({
      collection: 'soldTickets',
      where: {
        and: [
          { personalNumber: { equals: personalNumber } },
          { status: { equals: 'paid' } },
        ],
      },
    })

    if (paidTickets.totalDocs >= 3) {
      return NextResponse.json(
        { error: 'You have already purchased the maximum of 3 tickets with this ID.' },
        { status: 400 }
      )
    }

    const existingTicket = await payload
      .findByID({ collection: 'tickets', id: ticketId, depth: 0 })
      .catch(() => null)

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'This ticket type is no longer available.' },
        { status: 404 }
      )
    }

    if (existingTicket.status !== 'active' || Number(existingTicket.quantity) <= 0) {
      return NextResponse.json(
        { error: 'Sorry, this ticket has just sold out. Please pick another option.' },
        { status: 400 }
      )
    }

    const ticketPrice = Number(existingTicket.priceGel) || 0

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    const pgOrderBody = {
      order: {
        typeRid: process.env.PG_TEST_TYPE_RID,
        amount: ticketPrice.toString(),
        currency: 'GEL',
        description: `${existingTicket.title} - ${name} ${surname}`,
        language: 'ka',
        hppRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/pg-callback`,
        initiationEnvKind: 'Browser',
        consumerDevice: {
          browser: {
            javaEnabled: false,
            jsEnabled: true,
            acceptHeader: 'application/json',
            ip,
            colorDepth: '24',
            screenW: '1920',
            screenH: '1080',
            tzOffset: '-240',
            language: 'ka-GE',
            userAgent,
          },
        },
      },
    }

    const pgResponse = await callPGOrder(pgOrderBody)
    console.log('PG Response:', pgResponse)

    if (!pgResponse.order?.id) {
      const pgErr = pgResponse.errorDescription || pgResponse.errorCode
      return NextResponse.json(
        {
          error: pgErr
            ? `Payment provider rejected the request: ${pgErr}. Please try again or contact support.`
            : 'The payment system is temporarily unavailable. Please try again in a few minutes.',
          details: pgResponse,
        },
        { status: 502 }
      )
    }

    const newTicketId = uuidv4().slice(0, 8).toUpperCase()
    const qrData = generateTicketQRData(newTicketId, personalNumber, ticketId)
    const qrCodeDataUrl = await generateQRCode(qrData)

    await payload.create({
      collection: 'soldTickets',
      data: {
        id: newTicketId,
        personalNumber,
        email,
        name,
        surname,
        pgOrderId: Number(pgResponse.order.id),
        pgPassword: String(pgResponse.order.password ?? ''),
        amount: ticketPrice,
        status: 'pending',
        qrCode: qrCodeDataUrl,
        originalTicketId: ticketId,
        eventName: existingTicket.title,
        eventDate: toDate(existingTicket.eventDate),
        location: existingTicket.location,
        createdAt: new Date().toISOString(),
      },
    })

    const redirectUrl = `${pgResponse.order.hppUrl}?id=${pgResponse.order.id}&password=${pgResponse.order.password}`

    return NextResponse.json({
      success: true,
      redirectUrl,
      orderId: pgResponse.order.id,
      ticketId: newTicketId,
    })

  } catch (error) {
    console.error('create-order error:', error)
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error:
          'We could not start the payment right now. Please try again, or contact support if the issue persists.',
        details: message,
      },
      { status: 500 }
    )
  }
}
