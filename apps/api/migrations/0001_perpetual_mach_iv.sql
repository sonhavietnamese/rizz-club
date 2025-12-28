CREATE TABLE "users" (
	"id" integer PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"username" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL
);
