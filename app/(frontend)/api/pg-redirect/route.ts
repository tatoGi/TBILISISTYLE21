import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { verifyRedirectToken } from '@/lib/payment-security'

/**
 * Server-side redirect to the payment gateway's hosted payment page.
 * The client never sees the PG password — it stays server-side.
 *
 * GET /api/pg-redirect?token=<signed-token>
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=invalid_redirect`
    )
  }

  const parsed = verifyRedirectToken(token)

  if (!parsed) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=invalid_redirect`
    )
  }

  try {
    const payload = await getPayloadClient()

    const found = await payload.find({
      collection: parsed.collection,
      where: { pgOrderId: { equals: parsed.pgOrderId } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    const record = found.docs[0]

    if (!record || !record.pgHppUrl || !record.pgPassword) {
      const fallbackPath = parsed.collection === 'soldTickets'
        ? '/dashboard/tickets'
        : '/dashboard/shop'
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}${fallbackPath}?error=order_not_found`
      )
    }

    const hppUrl = `${record.pgHppUrl}?id=${parsed.pgOrderId}&password=${record.pgPassword}`
    return NextResponse.redirect(hppUrl)
  } catch (error) {
    console.error('pg-redirect error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets?error=server_error`
    )
  }
}
