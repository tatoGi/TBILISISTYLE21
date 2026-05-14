import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 300,
  })
}

export function generateTicketQRData(ticketId: string, personalNumber: string, eventId: string): string {
  return JSON.stringify({
    ticketId,
    personalNumber,
    eventId,
    timestamp: Date.now(),
    version: '1.0',
  })
}