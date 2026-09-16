CREATE TYPE "public"."scene_format" AS ENUM('story', 'carousel');--> statement-breakpoint
CREATE TYPE "public"."scene_status" AS ENUM('pending', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" uuid NOT NULL,
	"format" "scene_format" NOT NULL,
	"status" "scene_status" DEFAULT 'pending' NOT NULL,
	"url" text,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "scenes_product_id_format_index" ON "scenes" USING btree ("product_id","format");