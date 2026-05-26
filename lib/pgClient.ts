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
  return new https.Agent({
    cert: Buffer.from(process.env.PG_CERT_PATH!,"base64").toString(),
    key: Buffer.from(process.env.PG_KEY_PATH!,"base64").toString(),
    ca: Buffer.from(process.env.PG_CA_PATH!,"base64").toString(),
    rejectUnauthorized: false,
  })
}

export async function createOrder(body: unknown): Promise<PGOrderResponse> {
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