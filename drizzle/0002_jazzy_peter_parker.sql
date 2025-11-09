PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_absensi` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pegawai_id` integer NOT NULL,
	`weekday` integer DEFAULT 1 NOT NULL,
	`tanggal` text NOT NULL,
	`jam_masuk` integer,
	`jam_keluar` integer,
	`status_masuk` text,
	`status_keluar` text,
	`surat_dispensasi` text,
	`pengumpulan_surat_dispensasi` text,
	FOREIGN KEY (`pegawai_id`) REFERENCES `pegawai`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_absensi`("id", "pegawai_id", "weekday", "tanggal", "jam_masuk", "jam_keluar", "status_masuk", "status_keluar", "surat_dispensasi", "pengumpulan_surat_dispensasi") SELECT "id", "pegawai_id", "weekday", "tanggal", "jam_masuk", "jam_keluar", "status_masuk", "status_keluar", "surat_dispensasi", "pengumpulan_surat_dispensasi" FROM `absensi`;--> statement-breakpoint
DROP TABLE `absensi`;--> statement-breakpoint
ALTER TABLE `__new_absensi` RENAME TO `absensi`;--> statement-breakpoint
PRAGMA foreign_keys=ON;