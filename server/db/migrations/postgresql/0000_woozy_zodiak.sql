CREATE TABLE "amas" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"AMAName" text NOT NULL,
	"AMACompany" text,
	"AMATitle" text NOT NULL,
	"AMAAvatar" text
);
--> statement-breakpoint
CREATE TABLE "events" (
	"EventID" uuid PRIMARY KEY NOT NULL,
	"Title" text NOT NULL,
	"Description" text,
	"ScheduledStartTime" timestamp with time zone NOT NULL,
	"LeaderSlackId" text DEFAULT 'U040N4ESCEL' NOT NULL,
	"Approved" boolean DEFAULT false NOT NULL,
	"EventLink" text DEFAULT 'https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF' NOT NULL,
	"Cancelled" boolean DEFAULT false NOT NULL,
	"HasStarted" boolean DEFAULT false NOT NULL,
	"HasFinished" boolean DEFAULT false NOT NULL,
	"RSVPMessage" text
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"SentOneDayReminder" boolean DEFAULT false NOT NULL,
	"SentThreeHoursReminder" boolean DEFAULT false NOT NULL,
	"SentStartingReminder" boolean DEFAULT false NOT NULL,
	"RSVPedSlackID" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "amas" ADD CONSTRAINT "amas_event_id_events_EventID_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("EventID") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_id_events_EventID_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("EventID") ON DELETE no action ON UPDATE no action;