import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "../_components/AdminShell";
import ScannerClient from "./ScannerClient";

export const metadata: Metadata = {
  title: "Ticket Scanner | Admin",
};

export default async function AdminScanPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  return (
    <AdminShell title="Ticket Scanner" eyebrow="Entrance Control">
      <ScannerClient />
    </AdminShell>
  );
}
