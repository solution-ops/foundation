ALTER TYPE "public"."task_audit_action" ADD VALUE 'restore';--> statement-breakpoint
ALTER TYPE "public"."task_audit_action" ADD VALUE 'hard_delete';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "date_deleted" timestamp;--> statement-breakpoint
CREATE INDEX "tasks_date_deleted_idx" ON "tasks" USING btree ("date_deleted");