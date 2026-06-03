import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { AdminShell } from "../../_components/AdminShell";
import { ProductForm } from "../../_components/ProductForm";

export const metadata: Metadata = {
  title: "New Product | Admin",
};

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  return (
    <AdminShell
      title="New Product"
      eyebrow="Shop"
      actions={
        <Link
          href="/admin/products"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← Back to list
        </Link>
      }
    >
      <ProductForm />
    </AdminShell>
  );
}
