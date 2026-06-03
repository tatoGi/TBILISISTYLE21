import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient, getPgPool } from '@/lib/payload'
import { getOrderDetails } from '@/lib/pgClient'
import { sendProductOrderEmail } from '@/lib/email'

function qrDataUrlToBuffer(dataUrl?: string): Buffer | null {
  if (!dataUrl || !dataUrl.includes(',')) return null
  const base64 = dataUrl.split(',')[1]
  return Buffer.from(base64, 'base64')
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const id = searchParams.get('ID') || searchParams.get('id')
  const status = searchParams.get('STATUS') || searchParams.get('status')

  console.log(' PG Product Callback received:', { id, status })

  if (!id) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shop?error=invalid_callback`
    )
  }

  try {
    const payload = await getPayloadClient()

    const found = await payload.find({
      collection: 'productOrders',
      where: { pgOrderId: { equals: parseInt(id) } },
      limit: 1,
      pagination: false,
      depth: 0,
    })
    const order = found.docs[0]

    if (!order) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shop?error=order_not_found`
      )
    }

    const orderDetails = await getOrderDetails(parseInt(id), order.pgPassword as string)

    const isPaid =
      orderDetails.order?.status === 'Paid' ||
      orderDetails.order?.status === 'Completed' ||
      orderDetails.order?.status === 'FullyPaid' ||
      status === 'FullyPaid' ||
      status === 'Paid'

    if (isPaid && order.status === 'pending') {
      const paidAt = new Date().toISOString()
      const pool = await getPgPool()
      const productId = order.productId as string

      // Atomically decrement the purchased size's stock, only if still available.
      const dec = await pool.query(
        `UPDATE products_sizes SET quantity = quantity - 1
         WHERE _parent_id = $1 AND upper(size) = upper($2) AND quantity > 0
         RETURNING quantity`,
        [productId, order.size]
      )

      if (dec.rowCount !== 1) {
        await payload.update({
          collection: 'productOrders',
          id: order.id as string,
          data: { status: 'failed', failedAt: paidAt, failReason: 'sold_out' },
        })
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shop?error=sold_out`
        )
      }

      // If every size is now depleted, flip the product to sold_out.
      const remainingResult = await pool.query(
        `SELECT COALESCE(SUM(quantity), 0) AS remaining FROM products_sizes WHERE _parent_id = $1`,
        [productId]
      )
      if (Number(remainingResult.rows[0]?.remaining ?? 0) <= 0) {
        await pool.query(
          `UPDATE products SET status = 'sold_out', updated_at = now() WHERE id = $1`,
          [productId]
        )
      }

      await payload.update({
        collection: 'productOrders',
        id: order.id as string,
        data: { status: 'paid', paidAt },
      })

      // Send the pickup QR email (best-effort — never block confirmation).
      try {
        const qrBuffer = qrDataUrlToBuffer(order.qrCode as string | undefined)
        if (qrBuffer) {
          await sendProductOrderEmail(
            order.email as string,
            order.name as string,
            qrBuffer,
            order.id as string,
            order.productTitle as string,
            order.size as string
          )
        }
      } catch (mailError) {
        console.error(' Product order email failed:', mailError)
      }

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/success?orderId=${order.id}&type=product`
      )
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/fail?orderId=${id}`
    )
  } catch (error) {
    console.error(' Product callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/shop?error=server_error`
    )
  }
}
