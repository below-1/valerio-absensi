'use server';

import { eq } from "drizzle-orm";
import { db } from "../db";
import { pegawai } from "../db/schema";
import { revalidatePath } from "next/cache";

// app/actions/pegawai.ts - Add this function
export async function deletePegawai(id: number) {
  try {
    // Check if employee exists
    const existingPegawai = await db
      .select()
      .from(pegawai)
      .where(eq(pegawai.id, id))
      .limit(1);

    if (existingPegawai.length === 0) {
      return {
        success: false,
        error: 'Employee not found'
      };
    }

    // Delete employee
    await db
      .delete(pegawai)
      .where(eq(pegawai.id, id));

    revalidatePath('/pegawai');

    return {
      success: true,
      message: 'Employee deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting employee:', error);
    
    // Handle foreign key constraints if this employee has related records
    if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
      return {
        success: false,
        error: 'Cannot delete employee because they have related attendance records'
      };
    }

    return {
      success: false,
      error: 'Failed to delete employee'
    };
  }
}