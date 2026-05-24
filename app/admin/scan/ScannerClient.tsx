'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { TicketInfo } from './scan.type'

export default function ScannerClient() {
  const [scanResult, setScanResult] = useState<TicketInfo | null>(null)
  const [scanning, setScanning] = useState(true)
  const [scannerKey, setScannerKey] = useState(0)

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

        try {
          const res = await fetch('/api/validate-ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrData: decodedText }),
          })

          const data = (await res.json()) as TicketInfo
          setScanResult(data)
        } catch {
          setScanResult({
            valid: false,
            error: 'Ticket verification failed. Please try again.',
          })
        }
      },
      () => {
        // The scanner fires often while searching; keep the UI quiet.
      }
    )

    return () => {
      scanner.clear().catch(() => undefined)
    }
  }, [scannerKey])

  function startNewScan() {
    setScanResult(null)
    setScanning(true)
    setScannerKey((key) => key + 1)
  }

  const statusLabel = scanning
    ? 'Camera active'
    : scanResult?.valid
      ? 'Approved'
      : 'Rejected'

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="border border-white/10 bg-white/[0.03] p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black uppercase">Live Camera</h2>
            <p className="mt-1 text-sm text-white/55">
              Point the camera at the QR code on the ticket.
            </p>
          </div>
          <div className="flex items-center gap-3 border border-white/15 bg-white/[0.04] px-4 py-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                scanResult?.valid
                  ? 'bg-emerald-400'
                  : scanning
                    ? 'bg-yellow-300'
                    : 'bg-red-400'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="min-h-[360px] border border-white/10 bg-black p-3">
          {scanning ? (
            <div
              id="qr-reader"
              className="overflow-hidden [&_button]:border [&_button]:border-black/20 [&_button]:bg-black [&_button]:px-3 [&_button]:py-2 [&_button]:text-sm [&_button]:font-bold [&_button]:uppercase [&_button]:text-white [&_select]:border [&_select]:border-white/20 [&_select]:bg-black [&_select]:text-white [&_select]:px-2 [&_select]:py-2 [&_#qr-reader__dashboard]:bg-black [&_#qr-reader__dashboard]:text-white [&_#qr-reader__header_message]:text-white/60 [&_#qr-reader__status_span]:text-white/60"
            />
          ) : (
            <div className="flex min-h-[330px] items-center justify-center border border-white/10 bg-white/[0.02] text-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  Scanner paused
                </p>
                <p className="mt-2 text-sm text-white/65">
                  Review the result or start a new scan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="border border-white/10 bg-white/[0.03] p-5 md:p-6">
        {scanResult && scanResult.valid && scanResult.ticket ? (
          <div className="grid gap-5">
            <div className="border border-emerald-400/30 bg-emerald-400/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Valid Ticket
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase text-white">
                Entry Approved
              </h2>
            </div>

            <dl className="grid gap-3 text-sm">
              <TicketField label="Ticket ID" value={scanResult.ticket.id} />
              <TicketField
                label="Holder"
                value={`${scanResult.ticket.name} ${scanResult.ticket.surname}`}
              />
              <TicketField
                label="Personal Number"
                value={scanResult.ticket.personalNumber}
              />
              <TicketField label="Event" value={scanResult.ticket.eventName} />
              <TicketField
                label="Event Date"
                value={new Date(scanResult.ticket.eventDate).toLocaleString('en-US')}
              />
              <TicketField
                label="Paid At"
                value={new Date(scanResult.ticket.paidAt).toLocaleString('en-US')}
              />
            </dl>
          </div>
        ) : scanResult ? (
          <div className="grid gap-5">
            <div className="border border-red-400/30 bg-red-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                Invalid Ticket
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase text-white">
                Entry Rejected
              </h2>
            </div>

            <div className="border border-white/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                Reason
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {scanResult.error}
              </p>
              {scanResult.scannedAt && (
                <p className="mt-3 text-sm text-red-200">
                  Used at: {new Date(scanResult.scannedAt).toLocaleString('en-US')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[360px] items-center border border-white/10 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                Waiting For Scan
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase">
                No Ticket Checked
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Scan a ticket QR code to verify payment status and prevent duplicate entry.
              </p>
            </div>
          </div>
        )}

        {scanResult && (
          <button
            onClick={startNewScan}
            className="mt-5 w-full bg-yellow-300 px-5 py-4 text-xs font-black uppercase text-black transition hover:bg-white"
          >
            New Scan
          </button>
        )}
      </aside>
    </section>
  )
}

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold text-white">{value}</dd>
    </div>
  )
}
