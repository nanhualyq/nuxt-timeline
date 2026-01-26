CREATE TABLE `content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subscription_id` integer NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`time` text NOT NULL,
	`author` text,
	`image` text,
	`description` text,
	`content` text,
	`is_read` integer DEFAULT false NOT NULL,
	`is_star` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `content_link_unique` ON `content` (`link`);--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`enable` integer DEFAULT true NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`category` text,
	`code` text NOT NULL,
	`interval` text,
	`last_get_time` text
);
