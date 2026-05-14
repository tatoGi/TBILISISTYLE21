import { ObjectId } from 'mongodb'

export interface Event {
  _id?: ObjectId
  id: string
  name: string
  description: string
  date: Date
  venue: string
  price: number
  currency: string
  totalTickets: number
  soldTickets: number
  maxTicketsPerPerson: number
  isActive: boolean
  createdAt: Date
}