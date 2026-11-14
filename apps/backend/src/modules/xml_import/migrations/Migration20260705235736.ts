import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260705235736 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "xml_source" ("id" text not null, "name" text not null, "url" text not null, "schedule" text not null, "prefix_product" text null, "prefix_barcode" text null, "cdn_link" text null, "xml_main_tag" text null, "xml_products_tag" text null, "xml_product_tag" text null, "settings" jsonb null, "tag_mappings" jsonb null, "category_mappings" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "xml_source_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_xml_source_deleted_at" ON "xml_source" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "xml_source" cascade;`);
  }

}
