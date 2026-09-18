CREATE TYPE "public"."subscription_plan" AS ENUM('pro', 'business');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pending', 'authorized', 'paused', 'cancelled');--> statement-breakpoint
CREATE TABLE "product_creations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"store_id" uuid NOT NULL,
	"plan" "subscription_plan" NOT NULL,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"mercado_pago_preapproval_id" text,
	"checkout_url" text,
	"payer_email" text NOT NULL,
	"amount_in_ars" integer NOT NULL,
	"access_ends_at" timestamp,
	CONSTRAINT "subscriptions_mercado_pago_preapproval_id_unique" UNIQUE("mercado_pago_preapproval_id")
);
--> statement-breakpoint
ALTER TABLE "product_creations" ADD CONSTRAINT "product_creations_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_creations_store_id_created_at_index" ON "product_creations" USING btree ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "subscriptions_store_id_index" ON "subscriptions" USING btree ("store_id");--> statement-breakpoint
INSERT INTO "product_creations" ("store_id", "created_at") SELECT "store_id", "created_at" FROM "products";