import { NextRequest, NextResponse } from 'next/server'
import { getTicketsCollection } from '@/lib/mongodb'
import { createOrder as callPGOrder } from '@/lib/pgClient'
import { generateQRCode, generateTicketQRData } from '@/lib/qr'
import { v4 as uuidv4 } from 'uuid'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 API called: /api/create-order')
    
    const body = await req.json()
    console.log('📦 Request body:', body)
    
    const { name, surname, personalNumber, email, ticketId, amount, title } = body

    const ticketsCollection = await getTicketsCollection()
    console.log('✅ Connected to MongoDB')

    // Validate personal number limit
    const paidTicketsCount = await ticketsCollection.countDocuments({
      personalNumber: personalNumber,
      status: 'paid',
    })
    console.log(`📊 User ${personalNumber} has ${paidTicketsCount} paid tickets`)

    if (paidTicketsCount >= 3) {
      return NextResponse.json(
        { error: 'თქვენ უკვე შეიძინეთ მაქსიმუმ 3 ბილეთი' },
        { status: 400 }
      )
    }

    // Search by ObjectId
    let existingTicket = null
    
    console.log(`🔍 Searching for ticket with ID: ${ticketId}`)
    
    if (ObjectId.isValid(ticketId)) {
      console.log('✅ Valid ObjectId, searching by _id')
      existingTicket = await ticketsCollection.findOne({ _id: new ObjectId(ticketId) })
    } else {
      console.log('❌ Invalid ObjectId, searching by id field')
      existingTicket = await ticketsCollection.findOne({ id: ticketId })
    }
    
    if (!existingTicket) {
      console.log('❌ Ticket not found!')
      return NextResponse.json({ 
        error: 'ბილეთი არ მოიძებნა',
        searchedId: ticketId 
      }, { status: 404 })
    }
    
    console.log('✅ Ticket found:', { id: existingTicket._id, title: existingTicket.title, quantity: existingTicket.quantity })

    // Check quantity
    if (existingTicket.quantity <= 0) {
      return NextResponse.json({ error: 'ბილეთები გაყიდულია' }, { status: 400 })
    }

    // Get client IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    // Build Create Order request for PG
    const pgOrderBody = {
      order: {
        typeRid: process.env.PG_TEST_TYPE_RID,
        amount: amount.toString(),
        currency: 'GEL',
        description: `${existingTicket.title} - ${name} ${surname}`,
        language: 'ka',
        hppRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/pg-webhook`,
        initiationEnvKind: 'Browser',
        consumerDevice: {
          browser: {
            javaEnabled: false,
            jsEnabled: true,
            acceptHeader: 'application/json',
            ip: ip,
            colorDepth: '24',
            screenW: '1920',
            screenH: '1080',
            tzOffset: '-240',
            language: 'ka-GE',
            userAgent: userAgent,
          },
        },
      },
    }
    
    console.log('📤 Sending order to PG:', JSON.stringify(pgOrderBody, null, 2))

    const pgResponse = await callPGOrder(pgOrderBody)
    console.log('📥 PG Response:', pgResponse)

    if (!pgResponse.order || !pgResponse.order.id) {
      console.error('PG Error:', pgResponse)
      return NextResponse.json(
        { error: 'გადახდის სისტემასთან კავშირის შეცდომა', details: pgResponse },
        { status: 500 }
      )
    }

    // Generate unique ticket ID for this purchase
    const newTicketId = uuidv4().slice(0, 8).toUpperCase()
    const qrData = generateTicketQRData(newTicketId, personalNumber, ticketId)
    const qrCodeDataUrl = await generateQRCode(qrData)

    // Save purchased ticket
    const newTicket = {
      id: newTicketId,
      personalNumber: personalNumber,
      email: email,
      name: name,
      surname: surname,
      pgOrderId: pgResponse.order.id,
      pgPassword: pgResponse.order.password,
      amount: parseFloat(amount),
      status: 'pending',
      qrCode: qrCodeDataUrl,
      originalTicketId: ticketId,
      originalTicketObjectId: new ObjectId(ticketId),
      eventName: existingTicket.title,
      eventDate: existingTicket.eventDate,
      location: existingTicket.location,
      createdAt: new Date(),
    }
    
    console.log('💾 Saving ticket to DB:', newTicket)
    await ticketsCollection.insertOne(newTicket)
    console.log('✅ Ticket saved successfully')

    return NextResponse.json({
      success: true,
      redirectUrl: pgResponse.order.hppUrl,
      orderId: pgResponse.order.id,
      password: pgResponse.order.password,
      ticketId: newTicketId,
    })
    
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: 'სერვერის შეცდომა', details: error.message },
      { status: 500 }
    )
  }
}