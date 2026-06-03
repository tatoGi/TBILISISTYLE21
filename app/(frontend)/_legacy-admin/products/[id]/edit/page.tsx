import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";
import { getProduct } from "@/lib/products";
import { AdminShell } from "../../../_components/AdminShell";
import { ProductForm } from "../../../_components/ProductForm";

export const metadata: Metadata = {
  title: "Edit Product | Admin",
};

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }

  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell
      title="Edit Product"
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
      <ProductForm product={product} />
    </AdminShell>
  );
}
