ALTER TABLE "messages" ADD COLUMN "photo_urls" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "offer_price_in_ars" integer;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_final_offer" boolean DEFAULT false NOT NULL;