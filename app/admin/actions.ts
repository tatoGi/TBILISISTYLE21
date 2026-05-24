"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  createAdminToken,
  isAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  createTicket as insertTicket,
  deleteTicket as removeTicket,
  updateTicket as saveTicket,
  validateTicketInput,
} from "@/lib/tickets";

function getTicketPayload(formData: FormData) {
  return validateTicketInput({
    title: formData.get("title"),
    description: formData.get("description"),
    priceGel: formData.get("priceGel"),
    eventDate: formData.get("eventDate"),
    location: formData.get("location"),
    quantity: formData.get("quantity"),
    saleUrl: formData.get("saleUrl"),
    status: formData.get("status"),
  });
}

async function requireAdmin() {
  if (!(await isAdminSession())) {
    redirect("/admin?error=session");
  }
}

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") || "");

  if (!verifyAdminPassword(password)) {
    redirect("/admin?error=login");
  }

  const store = await cookies();
  store.set(adminCookieName, createAdminToken(), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(adminCookieName);
  redirect("/admin");
}

export async function createTicket(formData: FormData) {
  await requireAdmin();
  await insertTicket(getTicketPayload(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/tickets");
}

export async function updateTicket(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await saveTicket(id, getTicketPayload(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/tickets");
}

export async function deleteTicket(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await removeTicket(id);
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/tickets");
}
