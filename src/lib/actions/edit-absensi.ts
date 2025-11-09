"use server";

import { db } from "@/lib/db"; // your drizzle instance
import {
  absensi,
  AbsensiInsertType,
  StatusKeluar,
  statusKeluarEnum,
  StatusMasuk,
  statusMasukEnum,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const absensiSchema = z.object({
  id: z.coerce.number().min(1, "ID absensi wajib disertakan"),
  pegawaiId: z.coerce.number().min(1, "Pegawai wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jamMasuk: z.string().optional(),
  jamKeluar: z.string().optional(),
  statusMasuk: z.enum(statusMasukEnum),
  statusKeluar: z.enum(statusKeluarEnum).optional(),
  scoreMasuk: z.coerce.number().min(-5).max(5),
  scoreKeluar: z.coerce.number().min(-5).max(5),
  totalScore: z.coerce.number().min(-10).max(10),
  dispensasi: z.coerce.boolean().optional(),
  suratDispensasi: z.string().optional(),
  pengumpulanSuratDispensasi: z.string().optional(),
});

// Helper: convert "HH:mm" to minutes since midnight
function toMinutes(time?: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const r = h * 60 + m;
  return isNaN(r) ? null : r;
}

export async function editAbsensi(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = absensiSchema.safeParse(raw);

  if (!parsed.success) {
    console.error("❌ Validation error:", parsed.error.flatten());
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  const data = parsed.data;

  // Ensure absensi exists before updating
  const existing = await db
    .select()
    .from(absensi)
    .where(eq(absensi.id, data.id))
    .get();

  if (!existing) {
    return {
      success: false,
      error: "Data absensi tidak ditemukan.",
    };
  }

  const duplicateTanggal = await db
    .select()
    .from(absensi)
    .where(
      and(
        eq(absensi.pegawaiId, parsed.data.pegawaiId),
        eq(absensi.tanggal, parsed.data.tanggal)
      )
    )
    .all();
  if (duplicateTanggal.length > 0 && duplicateTanggal[0].id !== data.id) {
    return {
      success: false,
      error: "Absensi untuk pegawai pada tanggal tersebut sudah ada.",
    };
  }

  const val = {
    pegawaiId: data.pegawaiId,
    tanggal: data.tanggal,
    jamMasuk: toMinutes(data.jamMasuk),
    jamKeluar: toMinutes(data.jamKeluar),
    statusMasuk: data.statusMasuk as StatusMasuk,
    statusKeluar: data.statusKeluar as StatusKeluar,
    scoreMasuk: data.scoreMasuk,
    scoreKeluar: data.scoreKeluar,
    totalScore: data.totalScore,
    dispensasi: data.dispensasi,
    suratDispensasi: data.suratDispensasi ?? null,
    pengumpulanSuratDispensasi: data.pengumpulanSuratDispensasi ?? null,
  } satisfies AbsensiInsertType;

  try {
    await db.update(absensi).set(val).where(eq(absensi.id, data.id));

    revalidatePath("/main/rekapan");
    console.log("✅ Absensi updated successfully:", data.id);

    return { success: true };
  } catch (err) {
    console.error("❌ Error updating absensi:", err);
    return {
      success: false,
      error: "Gagal memperbarui data absensi.",
    };
  }
}
