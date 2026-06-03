import { writeFileSync } from "fs";
import path from "path";
import { getPayload } from "payload";
import config from "@payload-config";

const RESULT = path.resolve(process.cwd(), "scripts/.init-result.txt");

try {
  const payload = await getPayload({ config });

  const existing = await payload.count({ collection: "users" });
  if (existing.totalDocs === 0) {
    const email = process.env.PAYLOAD_ADMIN_EMAIL || "tato.laperashvili95@gmail.com";
    const password =
      process.env.PAYLOAD_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "ChangeMe123!";
    await payload.create({
      collection: "users",
      data: { email, password, name: "Admin" },
    });
    writeFileSync(RESULT, `FIRST_USER_CREATED email=${email}\n`);
  } else {
    writeFileSync(RESULT, `Users already exist (${existing.totalDocs}); skipped.\n`);
  }
} catch (e) {
  writeFileSync(RESULT, "ERR: " + (e instanceof Error ? (e.stack ?? e.message) : String(e)));
}
