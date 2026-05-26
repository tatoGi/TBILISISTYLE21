'use client'

import { useState } from 'react'

interface BuyTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: string
    title: string
    priceGel: number
  }
}

export default function BuyTicketModal({ isOpen, onClose, ticket }: BuyTicketModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    personalNumber: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Sending ticket:', { 
      ticketId: ticket.id, 
      title: ticket.title, 
      priceGel: ticket.priceGel 
    })

    const checkRes = await fetch('/api/check-personal-number', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalNumber: formData.personalNumber }),
    })

    const checkData = await checkRes.json()

    if (!checkData.allowed) {
      setError(`You have already purchased a maximum of 3 tickets`)
      setLoading(false)
      return
    }

    const orderRes = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      surname: formData.surname,
      personalNumber: formData.personalNumber,
      email: formData.email,
      ticketId: ticket.id,      
      amount: ticket.priceGel.toString(),
      title: ticket.title,
    }),
  })

    const orderData = await orderRes.json()

    if (orderData.error) {
      setError(orderData.error)
      setLoading(false)
      return
    }

    if (orderData.redirectUrl) {
      onClose()
      window.open(orderData.redirectUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md bg-black border border-white/20 p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black uppercase text-yellow-300 mb-2">
          {ticket.title}
        </h2>
        <p className="text-3xl font-black text-white mb-6">{ticket.priceGel} GEL</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Name *</label>
            <input
              type="text"
              required
              className="w-full bg-white/10 border border-white/20 p-3 text-white focus:border-yellow-300 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                name: e.target.value.replace(/[^a-zA-Z\s]/g, ''), 
              })}
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Surname *</label>
            <input
              type="text"
              required
              className="w-full bg-white/10 border border-white/20 p-3 text-white focus:border-yellow-300 outline-none"
              value={formData.surname}
              onChange={(e) => setFormData({ 
                ...formData, 
                surname: e.target.value.replace(/[^a-zA-Z\s]/g, ''), 
              })}
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Personal number *</label>
            <input
              type="text"
              required
              maxLength={11}
              className="w-full bg-white/10 border border-white/20 p-3 text-white focus:border-yellow-300 outline-none"
              value={formData.personalNumber}
              onChange={(e) => setFormData({ ...formData, personalNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Email *</label>
            <input
              type="email"
              required
              className="w-full bg-white/10 border border-white/20 p-3 text-white focus:border-yellow-300 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-300 py-3 font-black uppercase text-black hover:bg-white transition disabled:opacity-50"
          >
            {loading ? 'in progress...' : 'payment'}
          </button>
        </form>
      </div>
    </div>
  )
}