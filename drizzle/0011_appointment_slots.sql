CREATE TABLE "appointment_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"note" text,
	"status" text DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "appointment_slots_status_sort_idx" ON "appointment_slots" USING btree ("status","sort_order");
--> statement-breakpoint
INSERT INTO "appointment_slots" ("label", "start_time", "end_time", "timezone", "note", "status", "sort_order") VALUES
	('Morning', '09:00', '11:00', 'Asia/Jakarta', 'Best for owner-led teams', 'active', 10),
	('Midday', '12:00', '14:00', 'Asia/Jakarta', 'Quick campaign mapping', 'active', 20),
	('Afternoon', '15:00', '17:00', 'Asia/Jakarta', 'Best for team review', 'active', 30);
