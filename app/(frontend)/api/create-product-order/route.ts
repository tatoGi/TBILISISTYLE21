import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getPayloadClient } from '@/lib/payload'
import { createOrder as callPGOrder } from '@/lib/pgClient'
import { generateQRCode } from '@/lib/qr'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, size, name, email, phone } = body

    // Server-side guards — clients may bypass UI validation
    if (typeof productId !== 'string' || !productId.trim()) {
      return NextResponse.json({ error: 'Missing product selection.' }, { status: 400 })
    }
    if (typeof size !== 'string' || !size.trim()) {
      return NextResponse.json({ error: 'Please select a size.' }, { status: 400 })
    }
    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide your full name.' }, { status: 400 })
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    if (typeof phone !== 'string' || phone.replace(/\D/g, '').length < 9) {
      return NextResponse.json({ error: 'Please provide a valid phone number.' }, { status: 400 })
    }

    const normalizedSize = size.trim().toUpperCase()
    const payload = await getPayloadClient()

    const product = await payload
      .findByID({ collection: 'products', id: productId, depth: 0 })
      .catch(() => null)

    if (!product) {
      return NextResponse.json(
        { error: 'This product is no longer available.' },
        { status: 404 }
      )
    }

    if (product.status !== 'active') {
      return NextResponse.json(
        { error: 'Sorry, this product is not available right now.' },
        { status: 400 }
      )
    }

    const sizes = Array.isArray(product.sizes) ? product.sizes : []
    const sizeEntry = sizes.find(
      (s: { size?: string; quantity?: number }) =>
        String(s.size).toUpperCase() === normalizedSize
    )

    if (!sizeEntry || Number(sizeEntry.quantity) <= 0) {
      return NextResponse.json(
        { error: 'Sorry, this size has just sold out. Please pick another.' },
        { status: 400 }
      )
    }

    const price = Number(product.priceGel) || 0

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    const pgOrderBody = {
      order: {
        typeRid: process.env.PG_TEST_TYPE_RID,
        amount: price.toString(),
        currency: 'GEL',
        description: `${product.title} (${normalizedSize}) - ${name}`,
        language: 'ka',
        hppRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/pg-product-callback`,
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

    const orderId = uuidv4().slice(0, 8).toUpperCase()
    const qrData = JSON.stringify({
      orderId,
      productId,
      size: normalizedSize,
      kind: 'merch',
      timestamp: Date.now(),
      version: '1.0',
    })
    const qrCodeDataUrl = await generateQRCode(qrData)

    await payload.create({
      collection: 'productOrders',
      data: {
        id: orderId,
        productId,
        productTitle: product.title,
        size: normalizedSize,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        pgOrderId: Number(pgResponse.order.id),
        pgPassword: String(pgResponse.order.password ?? ''),
        amount: price,
        status: 'pending',
        qrCode: qrCodeDataUrl,
        createdAt: new Date().toISOString(),
      },
    })

    const redirectUrl = `${pgResponse.order.hppUrl}?id=${pgResponse.order.id}&password=${pgResponse.order.password}`

    return NextResponse.json({
      success: true,
      redirectUrl,
      orderId: pgResponse.order.id,
      productOrderId: orderId,
    })
  } catch (error) {
    console.error('create-product-order error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
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
