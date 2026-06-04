"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct } from "@/lib/products";
import { deleteTicket } from "@/lib/tickets";
import { getPayloadClient } from "@/lib/payload";

// Pages and Products are created/edited through Payload's native collection
// editor (publish, blocks, locales). These admin list views only add a
// convenience bulk/row delete on top, so the only server actions left here are
// the delete handlers used by the List.js table's Remove button.

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function deleteTicketAdmin(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    return;
  }

  await deleteTicket(id);
  revalidatePath("/admin/tickets");
  revalidatePath("/admin/collections/tickets");
}

export async function deleteProductAdmin(formData: FormData) {
  const id = String(formData.get("id") || "");

  if (!id) {
    return;
  }

  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin/collections/products");
}

export async function deletePageAdmin(formData: FormData) {
  const id = getString(formData, "id");

  if (!id) {
    return;
  }

  const payload = await getPayloadClient();
  await payload.delete({ collection: "pages", id });
  revalidatePath("/admin/pages");
  revalidatePath("/admin/collections/pages");
}
