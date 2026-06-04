import type { AdminViewServerProps } from "payload";
import ScannerClient from "@/app/(frontend)/_legacy-admin/scan/ScannerClient";
import { AdminShell, PageHeader } from "./_ui";

export default function ScannerView(props: AdminViewServerProps) {
  return (
    <AdminShell {...props} breadcrumb={[{ label: "Scanner" }]}>
      <div className="ts21-admin-view">
        <div className="mx-auto grid max-w-7xl gap-6">
          <PageHeader
            eyebrow="Entrance Control"
            title="Ticket Scanner"
            description="Validate festival QR tickets at the gate."
          />
          <div className="ts21-scanner-frame">
            <ScannerClient />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
