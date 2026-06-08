/**
 * Seed starter Partners + News so the festival landing, /partners and /news are
 * populated out of the box. The content is placeholder — editors replace names,
 * logos and copy from the admin afterwards.
 *
 * Run locally (populates the local DB, uploads logos to public/media):
 *   npx payload run scripts/seed-partners-news.ts
 *
 * Run against PRODUCTION (uploads logos to Vercel Blob, writes to Neon):
 *   $env:POSTGRES_URL="<neon prod url>"
 *   $env:BLOB_READ_WRITE_TOKEN="<vercel blob token>"
 *   npx payload run scripts/seed-partners-news.ts
 *
 * Idempotent: a partner is skipped if its name exists, a post if its slug
 * exists — so re-running never duplicates (and never re-uploads their media).
 */
import path from "path";
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });

/** Upload one /public image as a media doc and return its id. */
async function uploadMedia(relPath: string, alt: string): Promise<string> {
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath: path.resolve(process.cwd(), "public", relPath),
  });
  return doc.id as string;
}

/** Minimal valid Lexical editor state for a single paragraph of text. */
function richText(text: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [
            {
              type: "text",
              text,
              format: 0,
              style: "",
              mode: "normal" as const,
              detail: 0,
              version: 1,
            },
          ],
        },
      ],
    },
  };
}

const PARTNERS = [
  { name: "Festival Partner 1", description: "ოფიციალური პარტნიორი — მოკლე აღწერა, რომელსაც ადმინში შეცვლით.", logo: "images/logo2.jpeg", website: "https://example.com", featuredOnHome: true, order: 10 },
  { name: "Festival Partner 2", description: "მხარდამჭერი ბრენდი — დაამატეთ რამდენიმე სიტყვა პარტნიორზე.", logo: "images/tbilisiStyleLogo.jpeg", website: "https://example.com", featuredOnHome: true, order: 20 },
  { name: "Festival Partner 3", description: "მედია პარტნიორი — მოკლე აღწერა ფესტივალთან თანამშრომლობაზე.", logo: "images/mainStage1.jpeg", website: "https://example.com", featuredOnHome: true, order: 30 },
  { name: "Festival Partner 4", description: "ტექნიკური პარტნიორი — placeholder ტექსტი, რომელიც შეიცვლება.", logo: "images/qvevriStage1.jpeg", website: "https://example.com", featuredOnHome: true, order: 40 },
  { name: "Festival Partner 5", description: "ლოკალური მხარდამჭერი — დაწერეთ მოკლე აღწერა აქ.", logo: "images/technoqvevri.jpeg", website: "", featuredOnHome: false, order: 50 },
  { name: "Festival Partner 6", description: "კულტურული პარტნიორი — მოკლე აღწერა, რომელსაც ადმინში დაარედაქტირებთ.", logo: "images/mission.jpeg", website: "", featuredOnHome: false, order: 60 },
];

const NEWS = [
  {
    slug: "festival-dates-announced",
    title: "ფესტივალის თარიღები გამოცხადდა",
    excerpt: "Tbilisi Style 21 ბრუნდება — შეიტყვეთ ზუსტი თარიღები და დეტალები.",
    cover: "images/mainStage1.jpeg",
    body: "ფესტივალის ზუსტი თარიღები და ლოკაცია მალე გამოცხადდება. გამოიწერეთ სიახლეები, რომ არაფერი გამოგრჩეთ.",
  },
  {
    slug: "lineup-first-announcement",
    title: "ლაინაფის პირველი ანონსი",
    excerpt: "პირველი არტისტები უკვე ცნობილია — სია თანდათან განახლდება.",
    cover: "images/joker1.jpeg",
    body: "სცენაზე ადგილობრივი და საერთაშორისო არტისტები შეგხვდებათ. სრული ლაინაფი მალე.",
  },
  {
    slug: "tickets-on-sale",
    title: "ბილეთები გაყიდვაშია",
    excerpt: "ადრეული ბილეთები შეზღუდული რაოდენობით ხელმისაწვდომია.",
    cover: "images/qvevriStage1.jpeg",
    body: "ადრეული ფასის ბილეთები შეზღუდული რაოდენობითაა — დაასწარით შეძენა მაღაზიის გვერდიდან.",
  },
];

// `--reset` deletes the seeded rows first, so a re-run refreshes their content
// (handy locally after a schema change). Skip it on production to preserve edits.
const RESET = process.env.SEED_RESET === "true" || process.argv.includes("--reset");
if (RESET) {
  await payload.delete({ collection: "partners", where: { name: { in: PARTNERS.map((p) => p.name) } } });
  await payload.delete({ collection: "posts", where: { slug: { in: NEWS.map((n) => n.slug) } } });
  console.error("[seed] --reset: removed existing seeded partners + news");
}

let partnersCreated = 0;
let newsCreated = 0;

for (const p of PARTNERS) {
  const existing = await payload.find({
    collection: "partners",
    where: { name: { equals: p.name } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs.length) continue;

  const logo = await uploadMedia(p.logo, p.name);
  await payload.create({
    collection: "partners",
    data: { name: p.name, description: p.description, logo, website: p.website, featuredOnHome: p.featuredOnHome, order: p.order },
  });
  partnersCreated += 1;
}

for (const n of NEWS) {
  const existing = await payload.find({
    collection: "posts",
    where: { slug: { equals: n.slug } },
    limit: 1,
    depth: 0,
  });
  if (existing.docs.length) continue;

  const coverImage = await uploadMedia(n.cover, n.title);
  await payload.create({
    collection: "posts",
    data: {
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      coverImage,
      featuredOnHome: true,
      publishedAt: new Date().toISOString(),
      _status: "published",
      layout: [{ blockType: "richText", content: richText(n.body) }],
    },
  });
  newsCreated += 1;
}

console.error(
  `[seed] partners: ${partnersCreated} created / ${PARTNERS.length - partnersCreated} skipped; ` +
    `news: ${newsCreated} created / ${NEWS.length - newsCreated} skipped`,
);

process.exit(0);
