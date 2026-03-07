CREATE TABLE "portfolio_projects" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"challenge" text NOT NULL,
	"solution" text NOT NULL,
	"outcome" text NOT NULL,
	"client_name" text NOT NULL,
	"service_type" text NOT NULL,
	"industry" text NOT NULL,
	"project_url" text NOT NULL,
	"cover_image" text NOT NULL,
	"gallery" jsonb NOT NULL,
	"tags" jsonb NOT NULL,
	"featured" boolean NOT NULL,
	"status" text NOT NULL,
	"sort_order" integer NOT NULL,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone NOT NULL,
	"seo" jsonb NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_projects_slug_unique" ON "portfolio_projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "portfolio_projects_status_idx" ON "portfolio_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "portfolio_projects_featured_idx" ON "portfolio_projects" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "portfolio_projects_sort_order_idx" ON "portfolio_projects" USING btree ("sort_order");