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
	"RSVPMessage" text,
	"slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"RSVPedSlackID" text NOT NULL,
	"event_id" uuid,
	"SentOneDayReminder" boolean DEFAULT false NOT NULL,
	"SentThreeHoursReminder" boolean DEFAULT false NOT NULL,
	"SentStartingReminder" boolean DEFAULT false NOT NULL,
	"EmailNotificationEnabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "rsvps_event_id_RSVPedSlackID_pk" PRIMARY KEY("event_id","RSVPedSlackID")
);
--> statement-breakpoint
ALTER TABLE "amas" ADD CONSTRAINT "amas_event_id_events_EventID_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("EventID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_id_events_EventID_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("EventID") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_unique" ON "events" USING btree ("slug");