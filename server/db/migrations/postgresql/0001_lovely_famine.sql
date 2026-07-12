ALTER TABLE "events" ADD COLUMN "EstimatedDuration" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "YouTubeURL" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "Tags" text[] DEFAULT '{}' NOT NULL;