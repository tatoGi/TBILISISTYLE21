import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface TicketData {
  id: string
  name: string
  surname: string
  personalNumber: string
  eventName: string
  eventDate: Date | string
  amount: number
  currency: string
  qrCodeDataUrl: string
}

export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 500])
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const eventDate = data.eventDate instanceof Date ? data.eventDate : new Date(data.eventDate)

  page.drawRectangle({
    x: 30, y: 30, width: 540, height: 440,
    borderColor: rgb(0.2, 0.4, 0.8),
    borderWidth: 2,
  })

  page.drawText('EVENT TICKET', {
    x: 50, y: 450, size: 28, font,
    color: rgb(0.2, 0.4, 0.8),
  })

  page.drawLine({
    start: { x: 50, y: 420 }, end: { x: 550, y: 420 },
    thickness: 1, color: rgb(0.8, 0.8, 0.8),
  })

  page.drawText(data.eventName, {
    x: 50, y: 390, size: 18, font,
    color: rgb(0, 0, 0),
  })

  page.drawText(`Date: ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}`, {
    x: 50, y: 355, size: 12, font: fontRegular,
  })

  page.drawText(`Name: ${data.name} ${data.surname}`, {
    x: 50, y: 325, size: 12, font: fontRegular,
  })

  page.drawText(`Personal Number: ${data.personalNumber}`, {
    x: 50, y: 300, size: 12, font: fontRegular,
  })

  page.drawText(`Amount Paid: ${data.amount} ${data.currency}`, {
    x: 50, y: 275, size: 12, font: fontRegular,
  })

  page.drawText(`Ticket ID: ${data.id}`, {
    x: 50, y: 245, size: 10, font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  })

  const qrImage = await pdfDoc.embedPng(data.qrCodeDataUrl.split(',')[1])
  page.drawImage(qrImage, { x: 400, y: 270, width: 140, height: 140 })

  page.drawText('Please present this ticket at the entrance', {
    x: 50, y: 60, size: 10, font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}