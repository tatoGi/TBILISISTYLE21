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
import { ObjectId } from "mongodb";
import {
  createTicket as insertTicket,
  deleteTicket as removeTicket,
  updateTicket as saveTicket,
  validateTicketInput,
} from "@/lib/tickets";
import { getMessageJobsCollection } from "@/lib/mongodb";
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

// --- Email queue actions ---

export async function retryEmailJob(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("jobId") || "");
  if (!ObjectId.isValid(jobId)) return;

  const jobs = await getMessageJobsCollection();
  await jobs.updateOne(
    { _id: new ObjectId(jobId) },
    {
      $set: {
        status: "pending",
        attempts: 0,
        lastError: null,
        updatedAt: new Date(),
      },
    },
  );

  await processTicketEmailJobs(1);
  revalidatePath("/admin/emails");
  revalidatePath("/admin");
}

export async function retryAllFailedEmails() {
  await requireAdmin();
  const jobs = await getMessageJobsCollection();
  await jobs.updateMany(
    { status: "failed" },
    {
      $set: {
        status: "pending",
        attempts: 0,
        lastError: null,
        updatedAt: new Date(),
      },
    },
  );
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
  if (!ObjectId.isValid(jobId)) return;

  const jobs = await getMessageJobsCollection();
  await jobs.deleteOne({ _id: new ObjectId(jobId) });
  revalidatePath("/admin/emails");
}
