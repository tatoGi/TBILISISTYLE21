/**
 * Create the first Payload admin user if none exists.
 * Run: npx payload run scripts/create-admin.ts
 * Uses PAYLOAD_ADMIN_EMAIL (default tato...) and ADMIN_PASSWORD (default changeme).
 */
import { getPayload } from "payload";
import config from "@payload-config";

const email = process.env.PAYLOAD_ADMIN_EMAIL || "tato.laperashvili95@gmail.com";
const password = process.env.ADMIN_PASSWORD || "Admin123!!!";

const payload = await getPayload({ config });
const match = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
  limit: 1,
  depth: 0,
});

if (match.totalDocs > 0) {
  // Reset the password to the configured one (handy for local dev / lost creds).
  await payload.update({ collection: "users", id: match.docs[0].id, data: { password } });
  console.error(`[create-admin] reset password for existing user: ${email}`);
} else {
  await payload.create({ collection: "users", data: { email, password } });
  console.error(`[create-admin] created admin user: ${email}`);
}
