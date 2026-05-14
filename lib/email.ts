import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendTicketEmail(
  to: string,
  name: string,
  pdfBuffer: Buffer,
  ticketId: string
) {
  await transporter.sendMail({
    from: `"Ticket Shop" <${process.env.GMAIL_USER}>`,
    to,
    subject: `🎫 Your Ticket #${ticketId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #2c3e50; text-align: center;">🎫 Thank You!</h1>
          <p style="font-size: 16px; color: #333;">Dear <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #333;">Your ticket purchase has been completed successfully.</p>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2c3e50;"><strong>Ticket #${ticketId}</strong></p>
            <p style="margin: 5px 0 0; color: #7f8c8d; font-size: 12px;">Attached to this email</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <p style="font-size: 14px; color: #7f8c8d; text-align: center;">
            Please present this ticket (digital or printed) at the entrance.<br />
            The QR code will be scanned for validation.
          </p>
          
          <p style="font-size: 12px; color: #95a5a6; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} Ticket Shop
          </p>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `ticket_${ticketId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}