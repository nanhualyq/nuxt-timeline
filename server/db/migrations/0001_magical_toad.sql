CREATE TABLE `subs_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sub_id` integer NOT NULL,
	`status` text NOT NULL,
	`info` text,
	`time` text NOT NULL,
	FOREIGN KEY (`sub_id`) REFERENCES `subscription`(`id`) ON UPDATE no action ON DELETE no action
);
