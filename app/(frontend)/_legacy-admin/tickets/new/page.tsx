import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "../../_components/AdminShell";
import { TicketForm } from "../../_components/TicketForm";

export const metadata: Metadata = {
  title: "New Ticket Type | Admin",
};

export const dynamic = "force-dynamic";

export default async function NewTicketPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  return (
    <AdminShell
      title="New Ticket Type"
      eyebrow="Catalog"
      actions={
        <Link
          href="/admin/tickets"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Back to list
        </Link>
      }
    >
      <TicketForm />
    </AdminShell>
  );
}
