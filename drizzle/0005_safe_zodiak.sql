CREATE TYPE "public"."notification_frequency" AS ENUM('immediate', 'daily', 'weekly');--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "included_in_digest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notification_frequency" "notification_frequency" DEFAULT 'immediate' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_digest_sent" timestamp;