import type { Payload, PayloadRequest } from "payload";

// Demo merch shared by the seed migration and the runtime boot seeder, so both
// stay in sync. Idempotent: a product is only created when its title is absent.

export type SeedSize = { size: string; quantity: number };
export type SeedProduct = {
  title: string;
  description: string;
  priceGel: number;
  category: string;
  isVip: boolean;
  imageUrl: string;
  status: "active" | "sold_out";
  sizes: SeedSize[];
};

// Mockup photos served from /public — identical locally and on Vercel.
const PHOTOS = [
  "/images/logo2.jpeg",
  "/images/tbilisiStyleLogo.jpeg",
  "/images/mainStage1.jpeg",
  "/images/qvevriStage1.jpeg",
  "/images/technoqvevri.jpeg",
  "/images/joker1.jpeg",
  "/images/ukrainianday.jpeg",
  "/images/mission.jpeg",
];

const standardSizes = (): SeedSize[] => [
  { size: "S", quantity: 12 },
  { size: "M", quantity: 20 },
  { size: "L", quantity: 18 },
  { size: "XL", quantity: 10 },
];

export const TSHIRTS: SeedProduct[] = Array.from({ length: 15 }).map((_, i) => {
  const n = i + 1;
  const isVip = n % 5 === 0; // every 5th is a VIP edition
  const soldOut = n === 7; // one demo sold-out item
  return {
    title: `Tbilisi Style 21 Tee #${String(n).padStart(2, "0")}`,
    description:
      "Premium 100% cotton festival t-shirt with the Tbilisi Style 21 print. Unisex fit, screen-printed artwork.",
    priceGel: 45 + (n % 4) * 10, // 45 / 55 / 65 / 75
    category: isVip ? "VIP Merch" : "T-Shirts",
    isVip,
    imageUrl: PHOTOS[i % PHOTOS.length],
    status: soldOut ? "sold_out" : "active",
    sizes: standardSizes(),
  };
});

/**
 * Create any missing demo t-shirts. Safe to call repeatedly: existing titles
 * are skipped. Pass `req` when calling from a migration so the writes join the
 * migration transaction.
 */
export async function seedTshirts(
  payload: Payload,
  opts: { req?: PayloadRequest } = {}
): Promise<{ created: number; skipped: number }> {
  const { req } = opts;
  let created = 0;
  let skipped = 0;

  for (const tee of TSHIRTS) {
    const existing = await payload.find({
      collection: "products",
      where: { title: { equals: tee.title } },
      limit: 1,
      depth: 0,
      ...(req ? { req } : {}),
    });

    if (existing.docs.length) {
      skipped += 1;
      continue;
    }

    await payload.create({
      collection: "products",
      data: tee,
      ...(req ? { req } : {}),
    });
    created += 1;
  }

  return { created, skipped };
}

export async function removeSeededTshirts(
  payload: Payload,
  opts: { req?: PayloadRequest } = {}
): Promise<void> {
  const { req } = opts;
  for (const tee of TSHIRTS) {
    await payload.delete({
      collection: "products",
      where: { title: { equals: tee.title } },
      ...(req ? { req } : {}),
    });
  }
}
