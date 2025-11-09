'use server';

import { eq } from "drizzle-orm";
import { db } from "../db";
import { absensi } from "../db/schema";
import { revalidatePath } from "next/cache";
import { success } from "zod";

export async function deleteAbsensiAction(id: number) {
  try {
    await db.delete(absensi).where(eq(absensi.id, id));

    // Refresh the absensi page to show updated data
    revalidatePath('/main/rekapan')
  } catch (error) {
    console.error('Failed to delete absensi:', error)
    return {
      success: false,
      error: 'Gagal menghapus data absensi. Silakan coba lagi.'
    }
  }
}
