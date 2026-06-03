import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { listSoldTickets } from "@/lib/sold-tickets";
import { AdminShell } from "../_components/AdminShell";
import { SoldTicketsTable } from "../_components/SoldTicketsTable";

export const metadata: Metadata = {
  title: "Sold Tickets | Admin",
};

export default async function AdminSoldTicketsPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  const tickets = await listSoldTickets({ status: { equals: "paid" } });

  return (
    <AdminShell title="Sold Tickets" eyebrow="Transactions">
      <SoldTicketsTable tickets={tickets} />
    </AdminShell>
  );
}

export const dynamic = "force-dynamic";
