CREATE TABLE "creator_application_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"reviewer_user_id" text NOT NULL,
	"decision" text NOT NULL,
	"reason" text,
	"score_snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_creator_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"niches" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"platforms" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"creator_levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"creators_needed" integer DEFAULT 1 NOT NULL,
	"application_deadline" timestamp with time zone,
	"visibility" text DEFAULT 'invite_only' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_creator_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "collaboration_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collaboration_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_user_id" text NOT NULL,
	"body" text NOT NULL,
	"attachment_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_analysis_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"provider" text,
	"model" text,
	"policy_version" text NOT NULL,
	"evidence_cutoff" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "creator_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"proposal" text NOT NULL,
	"proposed_rate_minor" integer,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"portfolio_item_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_audience_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"social_account_id" uuid NOT NULL,
	"locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"age_bands" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"gender" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sample_size" integer,
	"source" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_metric_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"social_account_id" uuid NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_payment_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"label" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"trigger_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"provider_reference" text,
	"due_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"public_url" text,
	"storage_key" text,
	"brand_name" text,
	"result_snapshot" jsonb,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"username" text NOT NULL,
	"location" text,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bio" text,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"niches" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"collaboration_preferences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rate_card" jsonb,
	"availability" jsonb,
	"onboarding_status" text DEFAULT 'draft' NOT NULL,
	"visibility" text DEFAULT 'invite_only' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "creator_score_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_score_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_reference" text NOT NULL,
	"label" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analysis_run_id" uuid NOT NULL,
	"dimension" text NOT NULL,
	"score" numeric(6, 3) NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"reason" text NOT NULL,
	"improvement_suggestion" text,
	"limitations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_social_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_profile_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"handle" text NOT NULL,
	"profile_url" text NOT NULL,
	"external_account_id" text,
	"connection_status" text DEFAULT 'public_link' NOT NULL,
	"verified_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_application_reviews" ADD CONSTRAINT "creator_application_reviews_application_id_creator_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."creator_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_application_reviews" ADD CONSTRAINT "creator_application_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_creator_criteria" ADD CONSTRAINT "campaign_creator_criteria_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_creator_invitations" ADD CONSTRAINT "campaign_creator_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_creator_invitations" ADD CONSTRAINT "campaign_creator_invitations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_creator_invitations" ADD CONSTRAINT "campaign_creator_invitations_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_creator_invitations" ADD CONSTRAINT "campaign_creator_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_conversations" ADD CONSTRAINT "collaboration_conversations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_conversations" ADD CONSTRAINT "collaboration_conversations_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_conversations" ADD CONSTRAINT "collaboration_conversations_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_conversation_id_collaboration_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."collaboration_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_analysis_runs" ADD CONSTRAINT "creator_analysis_runs_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_applications" ADD CONSTRAINT "creator_applications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_applications" ADD CONSTRAINT "creator_applications_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_applications" ADD CONSTRAINT "creator_applications_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_audience_snapshots" ADD CONSTRAINT "creator_audience_snapshots_social_account_id_creator_social_accounts_id_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."creator_social_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_metric_snapshots" ADD CONSTRAINT "creator_metric_snapshots_social_account_id_creator_social_accounts_id_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."creator_social_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payment_milestones" ADD CONSTRAINT "creator_payment_milestones_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payment_milestones" ADD CONSTRAINT "creator_payment_milestones_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_payment_milestones" ADD CONSTRAINT "creator_payment_milestones_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_portfolio_items" ADD CONSTRAINT "creator_portfolio_items_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_score_evidence" ADD CONSTRAINT "creator_score_evidence_creator_score_id_creator_scores_id_fk" FOREIGN KEY ("creator_score_id") REFERENCES "public"."creator_scores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_scores" ADD CONSTRAINT "creator_scores_analysis_run_id_creator_analysis_runs_id_fk" FOREIGN KEY ("analysis_run_id") REFERENCES "public"."creator_analysis_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_social_accounts" ADD CONSTRAINT "creator_social_accounts_creator_profile_id_creator_profiles_id_fk" FOREIGN KEY ("creator_profile_id") REFERENCES "public"."creator_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_reviews_application_idx" ON "creator_application_reviews" USING btree ("application_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_creator_criteria_campaign_uidx" ON "campaign_creator_criteria" USING btree ("campaign_id");--> statement-breakpoint
CREATE UNIQUE INDEX "campaign_creator_invitation_uidx" ON "campaign_creator_invitations" USING btree ("campaign_id","creator_profile_id");--> statement-breakpoint
CREATE INDEX "campaign_invitations_workspace_status_idx" ON "campaign_creator_invitations" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "collaboration_conversation_campaign_creator_uidx" ON "collaboration_conversations" USING btree ("campaign_id","creator_profile_id");--> statement-breakpoint
CREATE INDEX "collaboration_messages_conversation_idx" ON "collaboration_messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "creator_analysis_profile_idx" ON "creator_analysis_runs" USING btree ("creator_profile_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_applications_campaign_profile_uidx" ON "creator_applications" USING btree ("campaign_id","creator_profile_id");--> statement-breakpoint
CREATE INDEX "creator_applications_workspace_status_idx" ON "creator_applications" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "creator_audience_account_observed_idx" ON "creator_audience_snapshots" USING btree ("social_account_id","observed_at");--> statement-breakpoint
CREATE INDEX "creator_metric_account_observed_idx" ON "creator_metric_snapshots" USING btree ("social_account_id","observed_at");--> statement-breakpoint
CREATE INDEX "creator_payment_workspace_status_idx" ON "creator_payment_milestones" USING btree ("workspace_id","status");--> statement-breakpoint
CREATE INDEX "creator_payment_creator_idx" ON "creator_payment_milestones" USING btree ("creator_profile_id","created_at");--> statement-breakpoint
CREATE INDEX "creator_portfolio_profile_idx" ON "creator_portfolio_items" USING btree ("creator_profile_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_profiles_user_uidx" ON "creator_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "creator_score_evidence_score_idx" ON "creator_score_evidence" USING btree ("creator_score_id");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_scores_run_dimension_uidx" ON "creator_scores" USING btree ("analysis_run_id","dimension");--> statement-breakpoint
CREATE UNIQUE INDEX "creator_social_profile_platform_uidx" ON "creator_social_accounts" USING btree ("creator_profile_id","platform");--> statement-breakpoint
CREATE INDEX "creator_social_handle_idx" ON "creator_social_accounts" USING btree ("platform","handle");