'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
interface TicketInfo {
  valid: boolean
  ticket?: {
    id: string
    name: string
    surname: string
    personalNumber: string
    eventName: string
    eventDate: string
    paidAt: string
  }
  error?: string
}

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<TicketInfo | null>(null)
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    scanner.render(
      async (decodedText) => {
        scanner.pause()
        setScanning(false)

        const res = await fetch('/api/validate-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrData: decodedText }),
        })

        const data = await res.json()
        setScanResult(data)
      },
      (error) => {
        console.error('QR Scan Error:', error)
      }
    )

    return () => {
      scanner.clear()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">🎫 QR სკანერი</h1>

        {scanning && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div id="qr-reader" className="w-full"></div>
            <p className="text-center text-gray-500 mt-4">
              მიმართეთ კამერა QR კოდს
            </p>
          </div>
        )}

        {scanResult && (
          <div className={`mt-6 p-6 rounded-xl shadow-md ${
            scanResult.valid ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {scanResult.valid && scanResult.ticket ? (
              <div>
                <h2 className="text-xl font-bold text-green-800 mb-4">
                  ✅ ბილეთი ვალიდურია
                </h2>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {scanResult.ticket.id}</p>
                  <p><strong>სახელი:</strong> {scanResult.ticket.name} {scanResult.ticket.surname}</p>
                  <p><strong>პირადი ნომერი:</strong> {scanResult.ticket.personalNumber}</p>
                  <p><strong>ღონისძიება:</strong> {scanResult.ticket.eventName}</p>
                  <p><strong>თარიღი:</strong> {new Date(scanResult.ticket.eventDate).toLocaleString()}</p>
                  <p><strong>გადახდილია:</strong> {new Date(scanResult.ticket.paidAt).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-red-800 mb-4">❌ {scanResult.error}</h2>
              </div>
            )}

            <button
              onClick={() => {
                setScanResult(null)
                setScanning(true)
                window.location.reload()
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              გადატვირთვა
            </button>
          </div>
        )}
      </div>
    </div>
  )
}