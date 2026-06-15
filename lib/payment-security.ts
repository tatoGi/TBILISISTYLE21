import { createHmac, timingSafeEqual } from 'crypto'

function getPaymentSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('Missing AUTH_SECRET or PAYLOAD_SECRET for payment signing')
  return secret
}

/**
 * Creates a signed redirect token encoding the PG order ID and collection.
 * The client receives this opaque token instead of the raw HPP URL with password.
 */
export function createRedirectToken(
  pgOrderId: number,
  collection: 'soldTickets' | 'productOrders'
): string {
  const data = `${pgOrderId}:${collection}`
  const sig = createHmac('sha256', getPaymentSecret()).update(data).digest('base64url')
  return Buffer.from(data).toString('base64url') + '.' + sig
}

/**
 * Verifies and decodes a redirect token.
 * Returns null if the signature is invalid or the token is malformed.
 */
export function verifyRedirectToken(
  token: string
): { pgOrderId: number; collection: 'soldTickets' | 'productOrders' } | null {
  const dotIdx = token.indexOf('.')
  if (dotIdx === -1) return null

  const dataPart = token.slice(0, dotIdx)
  const sig = token.slice(dotIdx + 1)
  if (!dataPart || !sig) return null

  const data = Buffer.from(dataPart, 'base64url').toString()
  const expectedSig = createHmac('sha256', getPaymentSecret()).update(data).digest('base64url')

  if (sig.length !== expectedSig.length) return null
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null

  const [pgOrderIdStr, collection] = data.split(':')
  const pgOrderId = parseInt(pgOrderIdStr, 10)
  if (Number.isNaN(pgOrderId)) return null
  if (collection !== 'soldTickets' && collection !== 'productOrders') return null

  return { pgOrderId, collection }
}

/**
 * Creates an HMAC signature for a payment callback URL.
 * Signed over our internal record ID (known before the PG call)
 * and included in hppRedirectUrl so we can verify the callback is authentic.
 */
export function createCallbackHmac(internalId: string): string {
  return createHmac('sha256', getPaymentSecret())
    .update(`callback:${internalId}`)
    .digest('hex')
}

/**
 * Verifies that a callback HMAC matches the expected value for an internal ID.
 */
export function verifyCallbackHmac(internalId: string, hmac: string): boolean {
  const expected = createCallbackHmac(internalId)
  if (expected.length !== hmac.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(hmac))
}
