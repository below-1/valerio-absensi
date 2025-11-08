CREATE TABLE `absensi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pegawai_id` integer NOT NULL,
	`tanggal` text NOT NULL,
	`jam_masuk` integer,
	`jam_keluar` integer,
	`status_masuk` text NOT NULL,
	`status_keluar` text,
	`surat_dispensasi` text,
	`pengumpulan_surat_dispensasi` text,
	FOREIGN KEY (`pegawai_id`) REFERENCES `pegawai`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pegawai` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nip` text NOT NULL,
	`nama` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pegawai_nip_unique` ON `pegawai` (`nip`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`last_login` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);