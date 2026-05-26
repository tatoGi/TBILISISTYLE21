import { NextRequest, NextResponse } from 'next/server'
import { getSoldTicketsCollection, getTicketsCollection } from '@/lib/mongodb'
import { createOrder as callPGOrder } from '@/lib/pgClient'
import { generateQRCode, generateTicketQRData } from '@/lib/qr'
import { v4 as uuidv4 } from 'uuid'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    console.log('API called: /api/create-order')

    const body = await req.json()
    const { name, surname, personalNumber, email, ticketId } = body

    const ticketsCollection = await getTicketsCollection()
    const soldTicketsCollection = await getSoldTicketsCollection()

    const paidTicketsCount = await soldTicketsCollection.countDocuments({
      personalNumber,
      status: 'paid',
    })

    if (paidTicketsCount >= 3) {
      return NextResponse.json(
        { error: 'თქვენ უკვე შეიძინეთ მაქსიმუმ 3 ბილეთი' },
        { status: 400 }
      )
    }

    let existingTicket = null
    if (ObjectId.isValid(ticketId)) {
      existingTicket = await ticketsCollection.findOne({ _id: new ObjectId(ticketId) })
    } else {
      existingTicket = await ticketsCollection.findOne({ id: ticketId })
    }

    if (!existingTicket) {
      return NextResponse.json({ error: 'ბილეთი არ მოიძებნა' }, { status: 404 })
    }

    if (existingTicket.status !== 'active' || existingTicket.quantity <= 0) {
      return NextResponse.json({ error: 'ბილეთები გაყიდულია' }, { status: 400 })
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
      return NextResponse.json(
        { error: 'გადახდის სისტემასთან კავშირის შეცდომა', details: pgResponse },
        { status: 500 }
      )
    }

    const newTicketId = uuidv4().slice(0, 8).toUpperCase()
    const qrData = generateTicketQRData(newTicketId, personalNumber, ticketId)
    const qrCodeDataUrl = await generateQRCode(qrData)

    await soldTicketsCollection.insertOne({
      id: newTicketId,
      personalNumber,
      email,
      name,
      surname,
      pgOrderId: pgResponse.order.id,
      pgPassword: pgResponse.order.password,
      amount: ticketPrice,
      status: 'pending',
      qrCode: qrCodeDataUrl,
      originalTicketId: ticketId,
      ...(ObjectId.isValid(ticketId) ? { originalTicketObjectId: new ObjectId(ticketId) } : {}),
      eventName: existingTicket.title,
      eventDate: existingTicket.eventDate,
      location: existingTicket.location,
      createdAt: new Date(),
    })

    const redirectUrl = `${pgResponse.order.hppUrl}?id=${pgResponse.order.id}&password=${pgResponse.order.password}`

    return NextResponse.json({
      success: true,
      redirectUrl,
      orderId: pgResponse.order.id,
      ticketId: newTicketId,
    })

  } catch (error) {
    console.error(' API Error:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
