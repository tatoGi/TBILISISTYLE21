import { getPayloadClient } from "./payload";

export type ProductStatus = "draft" | "active" | "sold_out";

export type ProductSize = {
  size: string;
  quantity: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  priceGel: number;
  imageUrl: string;
  category: string;
  isVip: boolean;
  sizes: ProductSize[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  title: string;
  description: string;
  priceGel: number;
  imageUrl: string;
  category: string;
  isVip: boolean;
  sizes: ProductSize[];
  status: ProductStatus;
};

const statuses: ProductStatus[] = ["draft", "active", "sold_out"];

function normalizeSizes(value: unknown): ProductSize[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const sizes: ProductSize[] = [];

  for (const entry of value) {
    const record = entry as Record<string, unknown>;
    const size = getString(record?.size).toUpperCase();
    if (!size || seen.has(size)) {
      continue;
    }
    seen.add(size);
    sizes.push({
      size,
      quantity: Math.max(0, Math.floor(getNumber(record?.quantity))),
    });
  }

  return sizes;
}

function serializeProduct(product: Record<string, unknown>): Product {
  const rawSizes = Array.isArray(product.sizes) ? product.sizes : [];
  return {
    id: String(product.id),
    title: (product.title as string) ?? "",
    description: (product.description as string) ?? "",
    priceGel: Number(product.priceGel ?? 0),
    imageUrl: (product.imageUrl as string) ?? "",
    category: (product.category as string) ?? "",
    isVip: Boolean(product.isVip),
    sizes: rawSizes.map((s: Record<string, unknown>) => ({
      size: (s.size as string) ?? "",
      quantity: Number(s.quantity ?? 0),
    })),
    status: (product.status as ProductStatus) ?? "draft",
    createdAt: (product.createdAt as string) ?? "",
    updatedAt: (product.updatedAt as string) ?? "",
  };
}

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  const numberValue =
    typeof value === "number" ? value : Number.parseFloat(String(value || "0"));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export function totalStock(sizes: ProductSize[]): number {
  return sizes.reduce((sum, s) => sum + Math.max(0, s.quantity), 0);
}

export function validateProductInput(input: Record<string, unknown>): ProductInput {
  const status = getString(input.status) as ProductStatus;
  const sizes = normalizeSizes(input.sizes);

  const product: ProductInput = {
    title: getString(input.title),
    description: getString(input.description),
    priceGel: getNumber(input.priceGel),
    imageUrl: getString(input.imageUrl),
    category: getString(input.category),
    isVip: input.isVip === true || input.isVip === "on" || input.isVip === "true",
    sizes,
    status: statuses.includes(status) ? status : "draft",
  };

  if (!product.title) {
    throw new Error("Product title is required.");
  }

  if (product.priceGel < 0) {
    throw new Error("Product price cannot be negative.");
  }

  if (!product.sizes.length) {
    throw new Error("Add at least one size with its stock quantity.");
  }

  return product;
}

export async function listProducts({ publicOnly = false } = {}) {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "products",
    where: publicOnly ? { status: { in: ["active", "sold_out"] } } : {},
    sort: "-createdAt",
    limit: 0,
    pagination: false,
    depth: 0,
  });

  return result.docs.map((d) => serializeProduct(d as unknown as Record<string, unknown>));
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!id) return null;
  const payload = await getPayloadClient();
  try {
    const product = await payload.findByID({ collection: "products", id, depth: 0 });
    return product ? serializeProduct(product as unknown as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function createProduct(input: ProductInput) {
  const payload = await getPayloadClient();
  const product = await payload.create({
    collection: "products",
    data: input,
  });
  return String(product.id);
}

export async function updateProduct(id: string, input: ProductInput) {
  const payload = await getPayloadClient();
  await payload.update({ collection: "products", id, data: input });
}

export async function deleteProduct(id: string) {
  const payload = await getPayloadClient();
  await payload.delete({ collection: "products", id });
}
