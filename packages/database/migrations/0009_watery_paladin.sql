CREATE TYPE "public"."agent_voice" AS ENUM('cordial', 'playful', 'direct');--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "agent_seed" text DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "agent_voice" "agent_voice" DEFAULT 'cordial' NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "agent_opens_negotiation" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "agent_mascot";--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "agent_color";--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "agent_tone";--> statement-breakpoint
DROP TYPE "public"."agent_tone";