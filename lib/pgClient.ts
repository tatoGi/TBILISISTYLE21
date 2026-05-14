/* eslint-disable @typescript-eslint/no-explicit-any */


const certBase64 = process.env.CERT_BASE64!
const keyBase64 = process.env.KEY_BASE64!

export async function createOrder(body: any) {
  const response = await fetch('https://3dss2test.quipu.de:8000/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Certificate-Base64': certBase64,
      'X-Private-Key-Base64': keyBase64,
    },
    body: JSON.stringify(body),
  })

  return response.json()
}

export async function getOrderDetails(orderId: number, password: string) {
  const url = `https://3dss2test.quipu.de:8000/order/${orderId}?password=${password}&tokenDetailLevel=1&tranDetailLevel=1`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Certificate-Base64': certBase64,
      'X-Private-Key-Base64': keyBase64,
    },
  })

  return response.json()
}