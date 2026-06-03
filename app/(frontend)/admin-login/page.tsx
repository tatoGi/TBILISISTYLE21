import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminConfigured, isAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "../_legacy-admin/_components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Sign in | Tbilisi Style 21",
};

export const dynamic = "force-dynamic";

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  if (await isAdminSession()) {
    redirect("/admin");
  }

  const params = await searchParams;

  return (
    <AdminLoginForm
      configured={isAdminConfigured()}
      initialError={params.error}
    />
  );
}
