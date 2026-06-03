"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminCookieName,
  createAdminToken,
  getAdminTokenMaxAge,
  isAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  createTicket as insertTicket,
  deleteTicket as removeTicket,
  updateTicket as saveTicket,
  validateTicketInput,
} from "@/lib/tickets";
import {
  createProduct as insertProduct,
  deleteProduct as removeProduct,
  updateProduct as saveProduct,
  validateProductInput,
} from "@/lib/products";
import { getPayloadClient } from "@/lib/payload";
import { processTicketEmailJobs } from "@/lib/message-broker";

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
    maxAge: getAdminTokenMaxAge(),
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
  redirect("/admin/tickets");
}

export async function updateTicket(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await saveTicket(id, getTicketPayload(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/tickets");
  redirect("/admin/tickets");
}

export async function deleteTicket(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await removeTicket(id);
  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard/tickets");
}

// --- Product actions ---

function parseSizes(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getProductPayload(formData: FormData) {
  return validateProductInput({
    title: formData.get("title"),
    description: formData.get("description"),
    priceGel: formData.get("priceGel"),
    imageUrl: formData.get("imageUrl"),
    category: formData.get("category"),
    isVip: formData.get("isVip"),
    sizes: parseSizes(formData.get("sizes")),
    status: formData.get("status"),
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  await insertProduct(getProductPayload(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await saveProduct(id, getProductPayload(formData));
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await removeProduct(id);
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/shop");
}

// --- Email queue actions ---

export async function retryEmailJob(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("jobId") || "");
  if (!jobId) return;

  const payload = await getPayloadClient();
  await payload.update({
    collection: "messageJobs",
    id: jobId,
    data: {
      status: "pending",
      attempts: 0,
      lastError: null,
      updatedAt: new Date().toISOString(),
    },
  });

  await processTicketEmailJobs(1);
  revalidatePath("/admin/emails");
  revalidatePath("/admin");
}

export async function retryAllFailedEmails() {
  await requireAdmin();
  const payload = await getPayloadClient();
  await payload.update({
    collection: "messageJobs",
    where: { status: { equals: "failed" } },
    data: {
      status: "pending",
      attempts: 0,
      lastError: null,
      updatedAt: new Date().toISOString(),
    },
  });
  await processTicketEmailJobs(20);
  revalidatePath("/admin/emails");
  revalidatePath("/admin");
}

export async function processEmailQueue() {
  await requireAdmin();
  await processTicketEmailJobs(20);
  revalidatePath("/admin/emails");
  revalidatePath("/admin");
}

export async function deleteEmailJob(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("jobId") || "");
  if (!jobId) return;

  const payload = await getPayloadClient();
  await payload.delete({ collection: "messageJobs", id: jobId });
  revalidatePath("/admin/emails");
}
