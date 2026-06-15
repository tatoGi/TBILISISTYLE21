'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { TicketInfo } from './scan.type'

type ScanMode = 'camera' | 'manual'

type RecentScan = {
  id: string
  name: string
  valid: boolean
  at: number
  reason?: string
}

export default function ScannerClient() {
  const [mode, setMode] = useState<ScanMode>('camera')
  const [scanResult, setScanResult] = useState<TicketInfo | null>(null)
  const [scanning, setScanning] = useState(true)
  const [scannerKey, setScannerKey] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [recent, setRecent] = useState<RecentScan[]>([])

  // Manual entry state
  const [manualTicketId, setManualTicketId] = useState('')
  const [manualPersonalNumber, setManualPersonalNumber] = useState('')
  const [manualError, setManualError] = useState('')

  const audioCtxRef = useRef<AudioContext | null>(null)

  function switchMode(next: ScanMode) {
    if (next === mode) return
    setMode(next)
    setScanResult(null)
    setManualError('')
    setCameraError(null)
    if (next === 'camera') {
      setScanning(true)
      setScannerKey((k) => k + 1)
    } else {
      setScanning(false)
    }
  }

  function beep(success: boolean) {
    try {
      if (typeof window === 'undefined') return
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = audioCtxRef.current ?? new Ctx()
      audioCtxRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = success ? 880 : 220
      gain.gain.value = 0.06
      osc.start()
      setTimeout(
        () => {
          try {
            osc.stop()
          } catch {
            /* ignore */
          }
        },
        success ? 180 : 360,
      )
    } catch {
      /* ignore */
    }
  }

  function handleResult(data: TicketInfo) {
    setScanResult(data)
    beep(data.valid)
    setRecent((prev) =>
      [
        {
          id: data.ticket?.id ?? 'unknown',
          name: data.ticket
            ? `${data.ticket.name} ${data.ticket.surname}`.trim()
            : '—',
          valid: !!data.valid,
          reason: data.valid ? undefined : data.error,
          at: Date.now(),
        },
        ...prev,
      ].slice(0, 10),
    )
  }

  async function validateRaw(qrData: string) {
    setSubmitting(true)
    setScanning(false)
    try {
      const res = await fetch('/api/validate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData }),
      })
      const data = (await res.json()) as TicketInfo
      handleResult(data)
    } catch {
      handleResult({
        valid: false,
        error: 'Ticket verification failed. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Camera scanner — only mounted in camera mode + when scanning
  useEffect(() => {
    if (mode !== 'camera' || !scanning) return

    let cancelled = false
    let scanner: Html5QrcodeScanner | null = null

    try {
      scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        },
        false,
      )
      scanner.render(
        async (decodedText) => {
          if (cancelled) return
          await scanner?.pause(true)
          await validateRaw(decodedText)
        },
        () => {
          /* ignore continuous scan failures */
        },
      )
    } catch (err) {
      const msg =
        err instanceof Error
          ? `Could not start camera: ${err.message}`
          : 'Could not start camera. Try a different browser, or use manual entry.'
      queueMicrotask(() => setCameraError(msg))
    }

    return () => {
      cancelled = true
      scanner?.clear().catch(() => undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerKey, mode, scanning])

  function startNewScan() {
    setScanResult(null)
    setManualError('')
    setManualTicketId('')
    setManualPersonalNumber('')
    setScanning(true)
    if (mode === 'camera') {
      setScannerKey((key) => key + 1)
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault()
    setManualError('')
    if (manualTicketId.trim().length < 4) {
      setManualError('Ticket ID is too short.')
      return
    }
    if (!/^\d{11}$/.test(manualPersonalNumber)) {
      setManualError('Personal number must be exactly 11 digits.')
      return
    }
    const payload = JSON.stringify({
      ticketId: manualTicketId.trim().toUpperCase(),
      personalNumber: manualPersonalNumber,
    })
    await validateRaw(payload)
  }

  const statusLabel = useMemo(() => {
    if (submitting) return 'Verifying…'
    if (scanResult?.valid) return 'Approved'
    if (scanResult) return 'Rejected'
    if (cameraError) return 'Camera error'
    if (mode === 'manual') return 'Manual entry'
    return scanning ? 'Camera active' : 'Paused'
  }, [submitting, scanResult, cameraError, scanning, mode])

  const statusDot = scanResult?.valid
    ? 'bg-emerald-500'
    : scanResult
      ? 'bg-rose-500'
      : cameraError
        ? 'bg-rose-500'
        : scanning && mode === 'camera'
          ? 'bg-amber-500 animate-pulse'
          : 'bg-slate-400'

  return (
    <div className="grid gap-6">
      {/* Mode toggle + status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <ModeButton current={mode} value="camera" onClick={() => switchMode('camera')}>
            <CameraIcon /> Camera
          </ModeButton>
          <ModeButton current={mode} value="manual" onClick={() => switchMode('manual')}>
            <KeyboardIcon /> Manual entry
          </ModeButton>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">
          <span className={`h-2 w-2 rounded-full ${statusDot}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            {statusLabel}
          </span>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        {/* LEFT: input */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          {mode === 'camera' ? (
            <>
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">Live camera</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Point the camera at the QR code on the ticket.
                </p>
              </div>

              {cameraError ? (
                <div className="grid gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm">
                  <div className="font-bold text-rose-700">Camera not available</div>
                  <div className="text-rose-700/90">{cameraError}</div>
                  <div className="text-rose-700/80">
                    Allow camera permission in your browser, or switch to{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('manual')}
                      className="font-bold underline"
                    >
                      manual entry
                    </button>
                    .
                  </div>
                </div>
              ) : (
                <div className="min-h-[360px] overflow-hidden rounded-xl border border-slate-900 bg-slate-950 p-3">
                  {scanning ? (
                    <div
                      id="qr-reader"
                      className="overflow-hidden [&_button]:rounded [&_button]:border [&_button]:border-white/15 [&_button]:bg-slate-800 [&_button]:px-3 [&_button]:py-2 [&_button]:text-sm [&_button]:font-bold [&_button]:uppercase [&_button]:text-white [&_select]:rounded [&_select]:border [&_select]:border-white/15 [&_select]:bg-slate-800 [&_select]:text-white [&_select]:px-2 [&_select]:py-2 [&_#qr-reader__dashboard]:bg-slate-950 [&_#qr-reader__dashboard]:text-white [&_#qr-reader__header_message]:text-white/60 [&_#qr-reader__status_span]:text-white/60 [&_img]:invert"
                    />
                  ) : (
                    <div className="flex min-h-[330px] items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-center text-white">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                          {submitting ? 'Verifying…' : 'Scanner paused'}
                        </p>
                        <p className="mt-2 text-sm text-white/70">
                          {submitting
                            ? 'Checking ticket against the database.'
                            : 'Review the result or start a new scan.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">Manual entry</h2>
                <p className="mt-1 text-sm text-slate-500">
                  When the QR is damaged or the camera cannot read it, enter the ticket
                  ID and the holder&apos;s personal number to verify.
                </p>
              </div>

              <form onSubmit={submitManual} className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ticket ID
                  </span>
                  <input
                    type="text"
                    value={manualTicketId}
                    onChange={(e) =>
                      setManualTicketId(e.target.value.toUpperCase().replace(/\s+/g, ''))
                    }
                    placeholder="e.g. DB39FDC9"
                    autoCapitalize="characters"
                    className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm tracking-wider text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Personal Number (11 digits)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={manualPersonalNumber}
                    onChange={(e) =>
                      setManualPersonalNumber(e.target.value.replace(/\D/g, '').slice(0, 11))
                    }
                    placeholder="01001012345"
                    className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                  <span className="text-xs text-slate-500">
                    {manualPersonalNumber.length}/11
                  </span>
                </label>

                {manualError ? (
                  <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {manualError}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {submitting ? 'Verifying…' : 'Verify ticket'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualTicketId('')
                      setManualPersonalNumber('')
                      setManualError('')
                      setScanResult(null)
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* RIGHT: result + recent */}
        <div className="grid gap-4">
          <ResultCard
            scanResult={scanResult}
            submitting={submitting}
            onNewScan={startNewScan}
          />
          <RecentScans recent={recent} />
        </div>
      </section>
    </div>
  )
}

function ResultCard({
  scanResult,
  submitting,
  onNewScan,
}: {
  scanResult: TicketInfo | null
  submitting: boolean
  onNewScan: () => void
}) {
  if (submitting && !scanResult) {
    return (
      <aside className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Verifying…
        </p>
        <p className="text-sm text-slate-600">Checking the ticket against the database.</p>
      </aside>
    )
  }

  if (scanResult?.valid && scanResult.ticket) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Valid ticket
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Entry approved</h2>
            <p className="mt-1 text-sm text-emerald-700">Hand over the wristband.</p>
          </div>

          <dl className="grid gap-3 text-sm">
            <Field label="Ticket ID" value={scanResult.ticket.id} mono />
            <Field
              label="Holder"
              value={`${scanResult.ticket.name} ${scanResult.ticket.surname}`}
            />
            <Field label="Personal Number" value={scanResult.ticket.personalNumber} mono />
            <Field label="Event" value={scanResult.ticket.eventName} />
            <Field
              label="Event date"
              value={new Date(scanResult.ticket.eventDate).toLocaleString('en-US')}
            />
            <Field
              label="Paid at"
              value={new Date(scanResult.ticket.paidAt).toLocaleString('en-US')}
            />
          </dl>

          <button
            type="button"
            onClick={onNewScan}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Next ticket →
          </button>
        </div>
      </aside>
    )
  }

  if (scanResult) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="grid gap-5">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
              Invalid ticket
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Entry rejected</h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Reason
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-800">{scanResult.error}</p>
            {scanResult.scannedAt && (
              <p className="mt-3 text-sm text-rose-700">
                Used at: {new Date(scanResult.scannedAt).toLocaleString('en-US')}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onNewScan}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex min-h-[260px] items-center rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm md:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Waiting for scan
        </p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">No ticket checked</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Scan a QR code, or switch to manual entry to verify by ticket ID.
        </p>
      </div>
    </aside>
  )
}

function RecentScans({ recent }: { recent: RecentScan[] }) {
  if (!recent.length) return null
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        Recent scans (this session)
      </h3>
      <ul className="divide-y divide-slate-100">
        {recent.map((r, i) => (
          <li
            key={`${r.id}-${r.at}-${i}`}
            className="flex items-center gap-3 py-2 text-sm"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                r.valid ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs font-bold text-slate-900">
                {r.id}
              </div>
              <div className="truncate text-xs text-slate-500">
                {r.valid ? r.name : r.reason}
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-slate-400">
              {new Date(r.at).toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-1 break-words text-sm font-semibold text-slate-900 ${mono ? 'font-mono tracking-wider' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}

function ModeButton({
  current,
  value,
  onClick,
  children,
}: {
  current: ScanMode
  value: ScanMode
  onClick: () => void
  children: React.ReactNode
}) {
  const active = current === value
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-bold transition ${
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
function KeyboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
    </svg>
  )
}
