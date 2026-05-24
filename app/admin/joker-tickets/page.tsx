import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { listJokerTickets } from "@/lib/sold-tickets";
import { AdminShell } from "../_components/AdminShell";
import { SoldTicketsTable } from "../_components/SoldTicketsTable";

export const metadata: Metadata = {
  title: "Joker Tickets | Admin",
};

export default async function AdminJokerTicketsPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  const tickets = await listJokerTickets();

  return (
    <AdminShell title="Joker Tickets">
      <SoldTicketsTable tickets={tickets} />
    </AdminShell>
  );
}
