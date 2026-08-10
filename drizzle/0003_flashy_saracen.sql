CREATE TYPE "public"."billing_interval" AS ENUM('monthly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'open', 'paid', 'void', 'uncollectible');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'cancelled', 'paused');--> statement-breakpoint
CREATE TABLE "billing_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"subtotal_minor" integer NOT NULL,
	"tax_minor" integer DEFAULT 0 NOT NULL,
	"total_minor" integer NOT NULL,
	"line_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"provider_invoice_id" text,
	"hosted_invoice_url" text,
	"invoice_pdf_url" text,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"due_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"metric" text NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"provider_meter_event_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"plan_code" text NOT NULL,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"interval" "billing_interval" DEFAULT 'monthly' NOT NULL,
	"included_brands" integer NOT NULL,
	"included_members" integer,
	"included_ai_actions" integer DEFAULT 0 NOT NULL,
	"additional_brand_slots" integer DEFAULT 0 NOT NULL,
	"provider_customer_id" text,
	"provider_subscription_id" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_usage" ADD CONSTRAINT "billing_usage_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_subscriptions" ADD CONSTRAINT "workspace_subscriptions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "billing_invoices_workspace_number_uidx" ON "billing_invoices" USING btree ("workspace_id","invoice_number");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_invoices_provider_uidx" ON "billing_invoices" USING btree ("provider_invoice_id");--> statement-breakpoint
CREATE INDEX "billing_invoices_workspace_status_idx" ON "billing_invoices" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "billing_usage_workspace_metric_period_uidx" ON "billing_usage" USING btree ("workspace_id","metric","period_start");--> statement-breakpoint
CREATE INDEX "billing_usage_workspace_period_idx" ON "billing_usage" USING btree ("workspace_id","period_end");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_subscriptions_workspace_uidx" ON "workspace_subscriptions" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_subscriptions_provider_uidx" ON "workspace_subscriptions" USING btree ("provider_subscription_id");