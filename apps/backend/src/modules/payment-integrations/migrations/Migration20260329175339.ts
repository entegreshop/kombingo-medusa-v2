import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260329175339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bank_account" ("id" text not null, "bank_name" text not null, "account_holder" text not null, "iban" text not null, "is_active" boolean not null default true, "branch_name" text null, "account_number" text null, "currency" text not null default 'TRY', "priority" integer not null default 100, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bank_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bank_account_deleted_at" ON "bank_account" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payment_credential" ("id" text not null, "provider_id" text not null, "is_active" boolean not null default true, "is_live" boolean not null default false, "list_name" text not null, "description" text null, "api_key" text null, "api_secret" text null, "merchant_id" text null, "extra_fee" integer not null default 0, "min_order_amount" integer not null default 0, "max_order_amount" integer null, "priority" integer not null default 100, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_credential_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_credential_deleted_at" ON "payment_credential" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "bank_account" cascade;`);

    this.addSql(`drop table if exists "payment_credential" cascade;`);
  }

}
