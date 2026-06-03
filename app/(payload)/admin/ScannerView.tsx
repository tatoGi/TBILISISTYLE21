import ScannerClient from "@/app/(frontend)/_legacy-admin/scan/ScannerClient";

export default function ScannerView() {
  return (
    <main className="px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
            Entrance Control
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Ticket Scanner
          </h1>
        </div>
        <ScannerClient />
      </div>
    </main>
  );
}
