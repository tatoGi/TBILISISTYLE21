import fetch from 'node-fetch'
import https from 'https'
import fs from 'fs'
import path from 'path'

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
    cert: fs.readFileSync(path.resolve(process.cwd(), process.env.PG_CERT_PATH!)),
    key: fs.readFileSync(path.resolve(process.cwd(), process.env.PG_KEY_PATH!)),
    ca: fs.readFileSync(path.resolve(process.cwd(), process.env.PG_CA_PATH!)),
    rejectUnauthorized: false,
  })
}

export async function createOrder(body: unknown): Promise<PGOrderResponse> {
  const response = await fetch('https://3dss2test.quipu.de:8000/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    agent: getAgent(),
  })
  return response.json() as Promise<PGOrderResponse>
}

export async function getOrderDetails(orderId: number, password: string): Promise<PGOrderDetailsResponse> {
  const url = `https://3dss2test.quipu.de:8000/order/${orderId}?password=${password}&tokenDetailLevel=1&tranDetailLevel=1`
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    agent: getAgent(),
  })
  return response.json() as Promise<PGOrderDetailsResponse>
}