"use server";

import { db } from "@/lib/db"; // your drizzle db instance
import { absensi, AbsensiInsertType, StatusKeluar, statusKeluarEnum, StatusMasuk, statusMasukEnum } from "@/lib/db/schema";
import { z } from "zod";

const absensiSchema = z.object({
  pegawaiId: z.coerce.number().min(1, "Pegawai wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jamMasuk: z.string().optional(),
  jamKeluar: z.string().optional(),
  statusMasuk: z.enum(statusMasukEnum),
  statusKeluar: z.enum(statusKeluarEnum).optional(),
  suratDispensasi: z.string().optional(),
  pengumpulanSuratDispensasi: z.string().optional(),
});

// Helper: convert "HH:mm" to minutes since midnight
function toMinutes(time?: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function addAbsensi(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = absensiSchema.safeParse(raw);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid input data");
  }

  const data = parsed.data;
  const val = {
    pegawaiId: data.pegawaiId,
    tanggal: data.tanggal,
    jamMasuk: toMinutes(data.jamMasuk),
    jamKeluar: toMinutes(data.jamKeluar),
    statusMasuk: data.statusMasuk as StatusMasuk,
    statusKeluar: data.statusKeluar as StatusKeluar,
    suratDispensasi: data.suratDispensasi ?? null,
    pengumpulanSuratDispensasi: data.pengumpulanSuratDispensasi ?? null,
  } satisfies AbsensiInsertType;

  await db.insert(absensi).values(val);

  console.log("✅ Absensi added successfully");
}
