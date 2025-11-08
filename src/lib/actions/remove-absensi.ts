'use server';

import { eq } from "drizzle-orm";
import { db } from "../db";
import { absensi } from "../db/schema";
import { revalidatePath } from "next/cache";

export async function deleteAbsensiAction(id: number) {
  try {
    await db.delete(absensi).where(eq(absensi.id, id));

    // Refresh the absensi page to show updated data
    revalidatePath('/main/rekapan')
  } catch (error) {
    console.error('Failed to delete absensi:', error)
    throw new Error('Gagal menghapus data absensi')
  }
}
