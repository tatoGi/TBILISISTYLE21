import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sold_tickets" ADD COLUMN "scanned_by" varchar;
  ALTER TABLE "sold_tickets" ADD COLUMN "pg_order_id" numeric;
  ALTER TABLE "sold_tickets" ADD COLUMN "pg_password" varchar;
  ALTER TABLE "sold_tickets" ADD COLUMN "qr_code" varchar;
  ALTER TABLE "sold_tickets" ADD COLUMN "failed_at" timestamp(3) with time zone;
  ALTER TABLE "sold_tickets" ADD COLUMN "fail_reason" varchar;
  ALTER TABLE "product_orders" ADD COLUMN "pg_order_id" numeric;
  ALTER TABLE "product_orders" ADD COLUMN "pg_password" varchar;
  ALTER TABLE "product_orders" ADD COLUMN "failed_at" timestamp(3) with time zone;
  ALTER TABLE "product_orders" ADD COLUMN "fail_reason" varchar;
  ALTER TABLE "message_jobs" ADD COLUMN "payload" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sold_tickets" DROP COLUMN "scanned_by";
  ALTER TABLE "sold_tickets" DROP COLUMN "pg_order_id";
  ALTER TABLE "sold_tickets" DROP COLUMN "pg_password";
  ALTER TABLE "sold_tickets" DROP COLUMN "qr_code";
  ALTER TABLE "sold_tickets" DROP COLUMN "failed_at";
  ALTER TABLE "sold_tickets" DROP COLUMN "fail_reason";
  ALTER TABLE "product_orders" DROP COLUMN "pg_order_id";
  ALTER TABLE "product_orders" DROP COLUMN "pg_password";
  ALTER TABLE "product_orders" DROP COLUMN "failed_at";
  ALTER TABLE "product_orders" DROP COLUMN "fail_reason";
  ALTER TABLE "message_jobs" DROP COLUMN "payload";`)
}
