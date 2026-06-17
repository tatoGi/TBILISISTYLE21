import fetch from 'node-fetch'
import https from 'https'


interface PGOrderResponse {
  order?: {
    id: number
    password: string
    hppUrl: string
    status: string
  }
  errorCode?: string
  errorDescription?: string
}

interface PGOrderDetailsResponse {
  order?: {
    id: number
    status: string
    amount: number
    currency: string
    typeRid: string
    createTime: string
  }
  errorCode?: string
  errorDescription?: string
}


function getAgent() {
  // Fail loudly (and clearly) if the gateway certificates are not configured,
  // instead of a cryptic "Buffer.from(undefined)" TypeError deep in the stack.
  const missing = (["PG_CERT_BASE64", "PG_KEY_BASE64", "PG_CA_BASE64"] as const).filter(
    (key) => !process.env[key],
  );
  if (missing.length) {
    throw new Error(
      `Payment gateway is not configured: missing env var(s) ${missing.join(", ")}. ` +
        `Set them in the Vercel project (Settings → Environment Variables) and redeploy.`,
    );
  }

  return new https.Agent({
    cert: Buffer.from(process.env.PG_CERT_BASE64!, "base64"),
    key: Buffer.from(process.env.PG_KEY_BASE64!, "base64"),
    ca: Buffer.from(process.env.PG_CA_BASE64!, "base64"),
    // The Quipu test gateway uses a private PKI (ProCredit Group Root CA) that
    // Node rejects as SELF_SIGNED_CERT_IN_CHAIN even when its CA is supplied.
    // Default to strict verification; allow opting out for that gateway by
    // setting PG_TLS_REJECT_UNAUTHORIZED=false. (Mutual TLS via the client
    // certificate still authenticates the connection.)
    rejectUnauthorized: process.env.PG_TLS_REJECT_UNAUTHORIZED !== "false",
  });
}

export async function createOrder(body: unknown): Promise<PGOrderResponse> {
  if (!process.env.PG_API_URL) {
    throw new Error(
      "Payment gateway is not configured: missing env var PG_API_URL. " +
        "Set it in the Vercel project (Settings → Environment Variables) and redeploy.",
    );
  }
  // typeRid identifies the Quipu "order type" and must be a value issued by
  // Quipu for this merchant (PG_TEST_TYPE_RID). An empty value → the gateway
  // rejects with "OrderTypeNotFound"; surface that as a clear config error.
  const typeRid = (body as { order?: { typeRid?: unknown } })?.order?.typeRid;
  if (!typeRid) {
    throw new Error(
      "Payment gateway is not configured: missing env var PG_TEST_TYPE_RID " +
        "(the Order Type RID issued by Quipu). Set it in .env.local and in Vercel, then redeploy.",
    );
  }
  const response = await fetch(`${process.env.PG_API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    agent: getAgent(),
  })
  return response.json() as Promise<PGOrderResponse>
}

export async function getOrderDetails(orderId: number, password: string): Promise<PGOrderDetailsResponse> {
  const url = `${process.env.PG_API_URL}/${orderId}?password=${password}&tokenDetailLevel=1&tranDetailLevel=1`
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    agent: getAgent(),
  })
  return response.json() as Promise<PGOrderDetailsResponse>
}