import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { getTicket } from "@/lib/tickets";
import { AdminShell } from "../../../_components/AdminShell";
import { TicketForm } from "../../../_components/TicketForm";

export const metadata: Metadata = {
  title: "Edit Ticket Type | Admin",
};

export const dynamic = "force-dynamic";

type EditTicketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTicketPage({ params }: EditTicketPageProps) {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) {
    notFound();
  }

  return (
    <AdminShell
      title="Edit Ticket Type"
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
      <TicketForm ticket={ticket} />
    </AdminShell>
  );
}
