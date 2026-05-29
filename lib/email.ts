import { Resend } from 'resend'
import nodemailer, { type Transporter } from 'nodemailer'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'TbilisiStyle21'
const FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS ||
  process.env.GMAIL_USER ||
  'noreply@tbilisistyle21.com'
const REPLY_TO = process.env.EMAIL_REPLY_TO

let resendClient: Resend | null = null
let gmailTransporter: Transporter | null = null

function getResend(): Resend {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resendClient = new Resend(RESEND_API_KEY)
  }
  return resendClient
}

function getGmailTransporter(): Transporter {
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  }
  return gmailTransporter
}

function buildHtml(name: string, ticketId: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #2c3e50; text-align: center;">Thank You!</h1>
    <p style="font-size: 16px; color: #333;">Dear <strong>${escapeHtml(name)}</strong>,</p>
    <p style="font-size: 16px; color: #333;">Your ticket purchase has been completed successfully.</p>
    <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #2c3e50;"><strong>Ticket #${escapeHtml(ticketId)}</strong></p>
      <p style="margin: 5px 0 0; color: #7f8c8d; font-size: 12px;">Attached to this email</p>
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 14px; color: #7f8c8d; text-align: center;">
      Please present this ticket (digital or printed) at the entrance.<br />
      The QR code will be scanned for validation.
    </p>
    <p style="font-size: 12px; color: #95a5a6; text-align: center; margin-top: 20px;">
      © ${new Date().getFullYear()} TbilisiStyle21
    </p>
  </div>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendTicketEmail(
  to: string,
  name: string,
  pdfBuffer: Buffer,
  ticketId: string,
) {
  const subject = `Your Ticket #${ticketId}`
  const html = buildHtml(name, ticketId)
  const filename = `ticket_${ticketId}.pdf`

  // Prefer Resend (production-grade deliverability, DKIM/SPF, high rate limits)
  if (RESEND_API_KEY) {
    const result = await getResend().emails.send({
      from: `${FROM_NAME} <${FROM_ADDRESS}>`,
      to,
      subject,
      html,
      replyTo: REPLY_TO,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    })

    if (result.error) {
      throw new Error(`Resend send failed: ${result.error.message}`)
    }
    return
  }

  // Fallback: Gmail SMTP (development / emergency). Has 500/day limit.
  await getGmailTransporter().sendMail({
    from: `"${FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}
