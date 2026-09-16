CREATE TYPE "public"."visit_kind" AS ENUM('store', 'product', 'whatsapp');--> statement-breakpoint
CREATE TABLE "visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"store_id" uuid NOT NULL,
	"product_id" uuid,
	"kind" "visit_kind" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visits" ADD CONSTRAINT "visits_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visits_store_id_index" ON "visits" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "visits_product_id_index" ON "visits" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "visits_created_at_index" ON "visits" USING btree ("created_at");