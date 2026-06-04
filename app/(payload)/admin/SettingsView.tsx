import Link from "next/link";
import type { AdminViewServerProps } from "payload";
import { AdminShell, Alert, Badge, Button, Card, CardBody, CardHeader, PageHeader } from "./_ui";

export const dynamic = "force-dynamic";

const configLinks = [
  { title: "Site Menu", desc: "Reorder the public navigation menu.", href: "/admin/menu" },
  { title: "Users", desc: "Admin accounts that can sign in here.", href: "/admin/users" },
  { title: "Ticket Types", desc: "Prices, quantities and sale status.", href: "/admin/tickets" },
  { title: "Products", desc: "Merch catalog and stock by size.", href: "/admin/products" },
  { title: "Media", desc: "Uploaded images stored in Vercel Blob.", href: "/admin/media" },
];

export default function SettingsView(props: AdminViewServerProps) {
  const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL || "admin@tbilisistyle21.com";

  return (
    <AdminShell {...props} breadcrumb={[{ label: "Settings" }]}>
      <div className="ts21-admin-view">
        <div className="mx-auto grid max-w-5xl gap-7">
        <PageHeader
          eyebrow="Account"
          title="Settings"
          description="Admin account, sign-out and Payload configuration shortcuts."
          actions={
            <Button href="/admin/logout" color="danger" variant="soft" icon={<LogoutIcon />}>
              Sign out
            </Button>
          }
        />

        <Alert tone="primary">
          Payload owns the sidebar and header. These settings panels only replace the page content, so admin navigation stays stable.
        </Alert>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-5 border-b border-slate-100 bg-gradient-to-r from-[#eef1fb] to-white p-6">
            <span className="grid h-16 w-16 place-items-center rounded-lg bg-[#405189] text-2xl font-black text-white shadow-sm">
              A
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-black text-slate-900">Administrator</p>
                <Badge tone="primary">Payload</Badge>
              </div>
              <p className="truncate text-sm text-slate-500">{adminEmail}</p>
            </div>
          </div>
          <CardBody className="text-sm leading-6 text-slate-500">
            Admin access is handled by Payload users. The legacy password gate is still used only for legacy
            operational APIs and scanner helpers. Manage admin credentials in the{" "}
            <Link href="/admin/users" className="font-semibold text-[#405189] underline">
              Users
            </Link>{" "}
              management.
          </CardBody>
        </Card>

        <section className="grid gap-4">
          <h2 className="text-base font-bold text-slate-900">Configuration</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {configLinks.map((c) => (
              <Card key={c.href} className="transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                <CardHeader actions={<ArrowIcon />}>
                  <p className="text-base font-bold text-slate-900">{c.title}</p>
                  <p className="mt-1 min-h-10 text-sm text-slate-500">{c.desc}</p>
                </CardHeader>
                <CardBody className="pt-4">
                  <Button href={c.href} variant="soft" size="sm">
                    Open
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </div>
      </div>
    </AdminShell>
  );
}

function LogoutIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef1fb] text-[#405189]">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </span>
  );
}
