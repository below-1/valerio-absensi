// app/actions/pegawai.ts
'use server';

import { db } from '@/lib/db';
import { pegawai } from '@/lib/db/schema';
import { pegawaiFormSchema, pegawaiUpdateSchema } from '@/lib/schema-validation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

export async function updatePegawai(data: unknown) {
  try {
    const validatedData = pegawaiUpdateSchema.parse(data);

    // Check if employee exists
    const existingPegawai = await db
      .select()
      .from(pegawai)
      .where(eq(pegawai.id, validatedData.id))
      .limit(1);

    if (existingPegawai.length === 0) {
      return {
        success: false,
        errors: [{ path: 'root', message: 'Employee not found' }]
      };
    }

    // Check for duplicate NIP (excluding current employee)
    if (validatedData.nip !== existingPegawai[0].nip) {
      const duplicateNip = await db
        .select()
        .from(pegawai)
        .where(eq(pegawai.nip, validatedData.nip))
        .limit(1);

      if (duplicateNip.length > 0) {
        return {
          success: false,
          errors: [{ path: 'nip', message: 'NIP already exists' }]
        };
      }
    }

    // Update employee
    const result = await db
      .update(pegawai)
      .set({
        nip: validatedData.nip,
        nama: validatedData.nama,
        status: validatedData.status,
      })
      .where(eq(pegawai.id, validatedData.id))
      .returning();

    revalidatePath('/pegawai');

    return {
      success: true,
      data: result[0],
      message: 'Employee updated successfully'
    };
  } catch (error) {
    console.error('Error updating employee:', error);
    
    if (error instanceof z.ZodError) {
      const flattened: any = error.flatten();
      
      const fieldErrors: { path: string; message: string }[] = [];
      
      if (flattened.fieldErrors.id?.[0]) {
        fieldErrors.push({ path: 'root', message: flattened.fieldErrors.id[0] });
      }
      
      if (flattened.fieldErrors.nip?.[0]) {
        fieldErrors.push({ path: 'nip', message: flattened.fieldErrors.nip[0] });
      }
      
      if (flattened.fieldErrors.nama?.[0]) {
        fieldErrors.push({ path: 'nama', message: flattened.fieldErrors.nama[0] });
      }
      
      if (flattened.fieldErrors.status?.[0]) {
        fieldErrors.push({ path: 'status', message: flattened.fieldErrors.status[0] });
      }

      if (fieldErrors.length === 0 && flattened.formErrors?.[0]) {
        fieldErrors.push({ path: 'root', message: flattened.formErrors[0] });
      }

      return {
        success: false,
        errors: fieldErrors
      };
    }

    return {
      success: false,
      errors: [{ path: 'root', message: 'Failed to update employee' }]
    };
  }
}