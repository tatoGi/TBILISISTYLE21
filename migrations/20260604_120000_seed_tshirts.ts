import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Demo merch: 15 t-shirts so the storefront + homepage reel are populated on
// every fresh deploy. Idempotent — skips any product whose title already
// exists, so re-running (or running on an existing DB) never duplicates.

type SeedSize = { size: string; quantity: number }
type SeedProduct = {
  title: string
  description: string
  priceGel: number
  category: string
  isVip: boolean
  imageUrl: string
  status: 'active' | 'sold_out'
  sizes: SeedSize[]
}

// Mockup photos served from /public — work the same locally and on Vercel.
const PHOTOS = [
  '/images/logo2.jpeg',
  '/images/tbilisiStyleLogo.jpeg',
  '/images/mainStage1.jpeg',
  '/images/qvevriStage1.jpeg',
  '/images/technoqvevri.jpeg',
  '/images/joker1.jpeg',
  '/images/ukrainianday.jpeg',
  '/images/mission.jpeg',
]

const standardSizes = (): SeedSize[] => [
  { size: 'S', quantity: 12 },
  { size: 'M', quantity: 20 },
  { size: 'L', quantity: 18 },
  { size: 'XL', quantity: 10 },
]

const TSHIRTS: SeedProduct[] = Array.from({ length: 15 }).map((_, i) => {
  const n = i + 1
  const isVip = n % 5 === 0 // every 5th is a VIP edition
  const soldOut = n === 7 // one demo sold-out item
  return {
    title: `Tbilisi Style 21 Tee #${String(n).padStart(2, '0')}`,
    description:
      'Premium 100% cotton festival t-shirt with the Tbilisi Style 21 print. Unisex fit, screen-printed artwork.',
    priceGel: 45 + (n % 4) * 10, // 45 / 55 / 65 / 75
    category: isVip ? 'VIP Merch' : 'T-Shirts',
    isVip,
    imageUrl: PHOTOS[i % PHOTOS.length],
    status: soldOut ? 'sold_out' : 'active',
    sizes: standardSizes(),
  }
})

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const tee of TSHIRTS) {
    const existing = await payload.find({
      collection: 'products',
      where: { title: { equals: tee.title } },
      limit: 1,
      depth: 0,
      req,
    })
    if (existing.docs.length) continue

    await payload.create({
      collection: 'products',
      data: tee,
      req,
    })
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  for (const tee of TSHIRTS) {
    await payload.delete({
      collection: 'products',
      where: { title: { equals: tee.title } },
      req,
    })
  }
}
