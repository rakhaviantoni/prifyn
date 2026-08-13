CREATE TABLE "report_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_by_user_id" text,
	"name" text DEFAULT 'Growth report' NOT NULL,
	"cadence" text DEFAULT 'weekly' NOT NULL,
	"day_of_week" integer DEFAULT 1 NOT NULL,
	"day_of_month" integer DEFAULT 1 NOT NULL,
	"send_time" text DEFAULT '09:00' NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"views" jsonb DEFAULT '["Executive"]'::jsonb NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_sent_at" timestamp with time zone,
	"next_send_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "report_schedules_due_idx" ON "report_schedules" USING btree ("status","next_send_at");
--> statement-breakpoint
CREATE INDEX "report_schedules_org_idx" ON "report_schedules" USING btree ("organization_id");
