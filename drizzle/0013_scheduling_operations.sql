ALTER TABLE "appointment_slots" ADD COLUMN IF NOT EXISTS "duration_minutes" integer DEFAULT 30 NOT NULL;
--> statement-breakpoint
ALTER TABLE "appointment_slots" ADD COLUMN IF NOT EXISTS "buffer_minutes" integer DEFAULT 15 NOT NULL;
--> statement-breakpoint
ALTER TABLE "appointment_slots" ADD COLUMN IF NOT EXISTS "max_bookings_per_day" integer DEFAULT 4 NOT NULL;
--> statement-breakpoint
ALTER TABLE "appointment_slots" ADD COLUMN IF NOT EXISTS "owner_name" text;
--> statement-breakpoint
ALTER TABLE "appointment_slots" ADD COLUMN IF NOT EXISTS "owner_email" text;
--> statement-breakpoint
ALTER TABLE "appointment_slots" ADD COLUMN IF NOT EXISTS "meeting_location" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointment_blackout_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"reason" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "appointment_blackout_dates_date_uidx" ON "appointment_blackout_dates" USING btree ("date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_blackout_dates_status_idx" ON "appointment_blackout_dates" USING btree ("status");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointment_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"slot_id" uuid,
	"requested_date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"company_name" text NOT NULL,
	"owner_name" text,
	"owner_email" text,
	"meeting_location" text,
	"status" text DEFAULT 'requested' NOT NULL,
	"reschedule_token" text NOT NULL,
	"cancel_token" text NOT NULL,
	"reminder_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointment_bookings" ADD CONSTRAINT "appointment_bookings_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointment_bookings" ADD CONSTRAINT "appointment_bookings_slot_id_appointment_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."appointment_slots"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "appointment_bookings_reschedule_uidx" ON "appointment_bookings" USING btree ("reschedule_token");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "appointment_bookings_cancel_uidx" ON "appointment_bookings" USING btree ("cancel_token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_bookings_date_status_idx" ON "appointment_bookings" USING btree ("requested_date","status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointment_bookings_lead_idx" ON "appointment_bookings" USING btree ("lead_id");
