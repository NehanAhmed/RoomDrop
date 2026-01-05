CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_code" varchar(7) NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"message" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_code" varchar(7) NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"is_online" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(7) NOT NULL,
	"creator" varchar(100) NOT NULL,
	"duration" integer NOT NULL,
	"participants_count" integer DEFAULT 5 NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_code_rooms_code_fk" FOREIGN KEY ("room_code") REFERENCES "public"."rooms"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_room_code_rooms_code_fk" FOREIGN KEY ("room_code") REFERENCES "public"."rooms"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_room_code_idx" ON "messages" USING btree ("room_code");--> statement-breakpoint
CREATE INDEX "messages_timestamp_idx" ON "messages" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "participants_room_code_idx" ON "participants" USING btree ("room_code");--> statement-breakpoint
CREATE INDEX "participants_user_name_idx" ON "participants" USING btree ("user_name");--> statement-breakpoint
CREATE INDEX "participants_online_idx" ON "participants" USING btree ("is_online");--> statement-breakpoint
CREATE INDEX "code_idx" ON "rooms" USING btree ("code");--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "rooms" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "active_idx" ON "rooms" USING btree ("is_active");