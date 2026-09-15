CREATE TYPE "public"."comparable_source" AS ENUM('mercadolibre', 'facebook', 'other');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."escalation_kind" AS ENUM('buy_intent', 'scam_suspected');--> statement-breakpoint
CREATE TYPE "public"."image_kind" AS ENUM('original', 'primary', 'contextual');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('buyer', 'agent');--> statement-breakpoint
CREATE TYPE "public"."pipeline_stage" AS ENUM('identifying', 'imaging', 'writing', 'researching', 'completed');--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('new', 'used');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('processing', 'review', 'published', 'failed', 'sold');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('pending', 'answered');--> statement-breakpoint
CREATE TYPE "public"."agent_tone" AS ENUM('formal', 'casual', 'terse');--> statement-breakpoint
CREATE TABLE "comparables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"price_in_ars" integer NOT NULL,
	"source" "comparable_source" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"buyer_token" text NOT NULL,
	"status" "conversation_status" DEFAULT 'open' NOT NULL,
	"counter_offer_count" integer DEFAULT 0 NOT NULL,
	"last_counter_offer_in_ars" integer,
	"last_buyer_offer_in_ars" integer,
	"agreed_price_in_ars" integer,
	"last_message_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"kind" "escalation_kind" NOT NULL,
	"summary" text NOT NULL,
	"agreed_price_in_ars" integer,
	"seen_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"kind" "image_kind" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"store_id" uuid NOT NULL,
	"title" text,
	"description" text,
	"condition" "product_condition",
	"condition_notes" text,
	"attributes" text[] DEFAULT '{}' NOT NULL,
	"seller_notes" text,
	"list_price_in_ars" integer,
	"floor_price_in_ars" integer,
	"suggested_minimum_price_in_ars" integer,
	"suggested_maximum_price_in_ars" integer,
	"status" "product_status" DEFAULT 'processing' NOT NULL,
	"pipeline_stage" "pipeline_stage" DEFAULT 'identifying' NOT NULL,
	"pipeline_error" text,
	"published_at" timestamp,
	"sold_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"product_id" uuid NOT NULL,
	"conversation_id" uuid,
	"question" text NOT NULL,
	"answer" text,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"answered_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"handle" text NOT NULL,
	"color" text NOT NULL,
	"whatsapp_phone" text NOT NULL,
	"notify_by_whatsapp" boolean DEFAULT true NOT NULL,
	"notify_by_email" boolean DEFAULT true NOT NULL,
	"agent_name" text NOT NULL,
	"agent_mascot" text NOT NULL,
	"agent_color" text NOT NULL,
	"agent_tone" "agent_tone" DEFAULT 'casual' NOT NULL,
	"agent_context" text,
	"max_counter_offers" integer DEFAULT 3 NOT NULL,
	"first_concession_percent" integer DEFAULT 40 NOT NULL,
	"subsequent_concession_percent" integer DEFAULT 50 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comparables" ADD CONSTRAINT "comparables_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comparables_product_id_index" ON "comparables" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_product_id_buyer_token_unique_index" ON "conversations" USING btree ("product_id","buyer_token");--> statement-breakpoint
CREATE INDEX "conversations_store_id_index" ON "conversations" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "escalations_conversation_id_index" ON "escalations" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "escalations_store_id_index" ON "escalations" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "images_product_id_index" ON "images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_id_index" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "products_store_id_index" ON "products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "questions_product_id_index" ON "questions" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stores_owner_id_unique_index" ON "stores" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stores_handle_unique_index" ON "stores" USING btree ("handle");