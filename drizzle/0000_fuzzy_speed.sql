CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`size` text NOT NULL,
	`workflow` text NOT NULL,
	`consent` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inquiries_email_time` ON `inquiries` (`email`,`created_at`);