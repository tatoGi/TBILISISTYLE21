import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

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

export async function generateTicketPDF(
  data: TicketData
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()

  const page = pdfDoc.addPage([650, 1000])
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const eventDate =
    data.eventDate instanceof Date
      ? data.eventDate
      : new Date(data.eventDate)

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
  })
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0, 0, 0),
  })


  const bgBytes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/images/person2.jpeg`,
  ).then(res => res.arrayBuffer())

  const bgImage = await pdfDoc.embedJpg(bgBytes)
  
  const imageScale = 0.85
  const drawWidth = width * imageScale
  const drawHeight = (bgImage.height * drawWidth) / bgImage.width
  
  const x = (width - drawWidth) / 2
  const y = height - drawHeight - 200

  page.drawImage(bgImage, {
    x: x,
    y: y,
    width: drawWidth,
    height: drawHeight,
  })

  const orange = rgb(1, 0.45, 0.1)
  const orangeGlow = rgb(1, 0.6, 0.2)
  const white = rgb(1, 1, 1)

  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: orange,
    borderWidth: 2,
  })

  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: orangeGlow,
    borderWidth: 1,
    opacity: 0.5,
  })


  const welcomeText = "WELCOME TO"
  const welcomeWidth = fontRegular.widthOfTextAtSize(welcomeText, 22)
  page.drawText(welcomeText, {
    x: (width - welcomeWidth) / 2,
    y: 930,
    size: 22,
    font: fontRegular,
    color: white,
  })

  const mainTitle = "TBILISI STYLE 21"
  const mainTitleWidth = fontBold.widthOfTextAtSize(mainTitle, 42)
  page.drawText(mainTitle, {
    x: (width - mainTitleWidth) / 2,
    y: 875,
    size: 42,
    font: fontBold,
    color: orangeGlow,
  })

  const lineStartX = (width - 490) / 2
  page.drawLine({
    start: { x: lineStartX, y: 860 },
    end: { x: lineStartX + 490, y: 860 },
    thickness: 2,
    color: orange,
  })


  page.drawRectangle({
    x: 50,
    y: 90,
    width: 550,
    height: 420,
    borderColor: orange,
    borderWidth: 2,
  })

  const eventTicketText = "EVENT TICKET"
  const eventTicketWidth = fontBold.widthOfTextAtSize(eventTicketText, 32)
  page.drawText(eventTicketText, {
    x: (width - eventTicketWidth) / 2,
    y: 470,
    size: 32,
    font: fontBold,
    color: orangeGlow,
  })

  page.drawLine({
    start: { x: 80, y: 450 },
    end: { x: 570, y: 450 },
    thickness: 1,
    color: orangeGlow,
  })

  const eventNameWidth = fontBold.widthOfTextAtSize(data.eventName, 26)
  page.drawText(data.eventName, {
    x: (width - eventNameWidth) / 2,
    y: 400,
    size: 26,
    font: fontBold,
    color: orangeGlow,
  })

  const rows = [
    [
     `Date: ${formattedDate}`
    ],
    ["Name:", `${data.name} ${data.surname}`],
    ["Personal Number:", data.personalNumber],
    ["Amount Paid:", `${data.amount} ${data.currency}`],
    ["Ticket ID:", data.id],
  ]

  let startY = 350
  const gap = 45

  rows.forEach((row) => {
    page.drawText(row[0], {
      x: 70,
      y: startY,
      size: 16,
      font: fontBold,
      color: orangeGlow,
    })

    page.drawText(row[1], {
      x: 220,
      y: startY,
      size: 15,
      font: fontRegular,
      color: white,
    })

    startY -= gap
  })


  const qrImage = await pdfDoc.embedPng(
    data.qrCodeDataUrl.split(",")[1]
  )

  page.drawRectangle({
    x: 400,
    y: 180,
    width: 160,
    height: 160,
    borderColor: orangeGlow,
    borderWidth: 3,
  })

  page.drawImage(qrImage, {
    x: 410,
    y: 190,
    width: 140,
    height: 140,
  })

  const footerText = "PLEASE PRESENT THIS TICKET AT THE ENTRANCE"
  const footerWidth = fontRegular.widthOfTextAtSize(footerText, 12)
  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: 76,
    size: 12,
    font: fontRegular,
    color: white,
  })

  const pdfBytes = await pdfDoc.save()

  return Buffer.from(pdfBytes)
}