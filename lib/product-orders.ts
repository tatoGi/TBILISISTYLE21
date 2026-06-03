import type { Where } from "payload";
import { getPayloadClient } from "@/lib/payload";

export type ProductOrder = {
  id: string;
  productId: string;
  productTitle: string;
  size: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  qrCode?: string;
  createdAt?: string | Date;
  paidAt?: string | Date;
  collectedAt?: string | Date;
};

function serializeProductOrder(order: Record<string, unknown>): ProductOrder {
  return {
    id: order.id as string,
    productId: (order.productId as string) ?? "",
    productTitle: (order.productTitle as string) ?? "",
    size: (order.size as string) ?? "",
    name: (order.name as string) ?? "",
    email: (order.email as string) ?? "",
    phone: (order.phone as string) ?? "",
    amount: Number(order.amount ?? 0),
    status: (order.status as string) ?? "pending",
    qrCode: order.qrCode as string | undefined,
    createdAt: order.createdAt as string | Date | undefined,
    paidAt: order.paidAt as string | Date | undefined,
    collectedAt: order.collectedAt as string | Date | undefined,
  };
}

export async function listProductOrders(where: Where = {}) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "productOrders",
    where,
    sort: ["-paidAt", "-createdAt"],
    limit: 0,
    pagination: false,
    depth: 0,
  });

  return result.docs.map((d) => serializeProductOrder(d as unknown as Record<string, unknown>));
}
