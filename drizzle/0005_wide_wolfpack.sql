CREATE TABLE "import_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"name" text NOT NULL,
	"mapping_version" integer DEFAULT 1 NOT NULL,
	"supported_extensions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_columns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"column_map" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metric_map" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_job_id" uuid NOT NULL,
	"row_number" integer NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"dimensions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"normalized_metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"row_hash" text NOT NULL,
	"status" text DEFAULT 'accepted' NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "import_mappings" ADD CONSTRAINT "import_mappings_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_mappings" ADD CONSTRAINT "import_mappings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_import_job_id_import_jobs_id_fk" FOREIGN KEY ("import_job_id") REFERENCES "public"."import_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "import_mappings_org_source_version_uidx" ON "import_mappings" USING btree ("organization_id","source_type","mapping_version");--> statement-breakpoint
CREATE INDEX "import_mappings_workspace_source_idx" ON "import_mappings" USING btree ("workspace_id","source_type");--> statement-breakpoint
CREATE UNIQUE INDEX "import_rows_job_row_uidx" ON "import_rows" USING btree ("import_job_id","row_number");--> statement-breakpoint
CREATE INDEX "import_rows_subject_idx" ON "import_rows" USING btree ("subject_type","subject_id");