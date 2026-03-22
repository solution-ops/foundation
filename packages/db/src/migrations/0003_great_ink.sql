CREATE TYPE "public"."task_audit_action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TABLE "task_audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" "task_audit_action" NOT NULL,
	"before_state" jsonb,
	"after_state" jsonb,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "task_audit_logs_task_id_idx" ON "task_audit_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_audit_logs_user_id_idx" ON "task_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_audit_logs_task_id_timestamp_idx" ON "task_audit_logs" USING btree ("task_id","timestamp");