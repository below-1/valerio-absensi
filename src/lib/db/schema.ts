import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { id } from "date-fns/locale";

// Enum values (for clarity and reuse)
export const statusMasukEnum = ['tepat_waktu', 'telat', 'alfa'] as const;
export const statusKeluarEnum = ['tepat_waktu', 'terlalu_cepat'] as const;

export type StatusMasuk = typeof statusMasukEnum[number];
export type StatusKeluar = typeof statusKeluarEnum[number];

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  lastLogin: integer("last_login", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const pegawai = sqliteTable("pegawai", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nip: text("nip").notNull().unique(),
  nama: text("nama").notNull(),
});

export const absensi = sqliteTable("absensi", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  pegawaiId: integer("pegawai_id")
    .notNull()
    .references(() => pegawai.id, { onDelete: "cascade" }),
  
  // Store weekday as integer start from 1
  weekday: integer("weekday").notNull().default(1),

  tanggal: text("tanggal").notNull(), // store date as ISO string (YYYY-MM-DD)
  jamMasuk: integer("jam_masuk"), // minutes since midnight
  jamKeluar: integer("jam_keluar"), // minutes since midnight

  statusMasuk: text("status_masuk", { enum: statusMasukEnum }).notNull(),
  statusKeluar: text("status_keluar", { enum: statusKeluarEnum }),

  suratDispensasi: text("surat_dispensasi"),
  pengumpulanSuratDispensasi: text("pengumpulan_surat_dispensasi"),
});

export const pegawaiRelations = relations(pegawai, ({ many }) => ({
  absensi: many(absensi),
}));

export const absensiRelations = relations(absensi, ({ one }) => ({
  pegawai: one(pegawai, {
    fields: [absensi.pegawaiId],
    references: [pegawai.id],
  }),
}));

export type AbsensiInsertType = typeof absensi.$inferInsert;
export type AbsensiSelectType = typeof absensi.$inferSelect;

type AbsensiItem = {
  pegawai: {
    id: number;
    nip: string;
    nama: string;
  },
  absensi?: {
    id: number;
    tanggal: string;
    jamMasuk?: number;
    jamKeluar?: number;
    statusMasuk: StatusMasuk;
    statusKeluar?: StatusKeluar;
    suratDispensasi?: string;
    pengumpulanSuratDispensasi?: string;
  }
}