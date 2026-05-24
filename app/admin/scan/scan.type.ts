export interface TicketInfo {
  valid: boolean
  ticket?: {
    id: string
    name: string
    surname: string
    personalNumber: string
    eventName: string
    eventDate: string
    amount?: number
    paidAt: string
  }
  error?: string
  scannedAt?: string
}