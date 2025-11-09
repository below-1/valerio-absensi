// app/actions/pegawai.ts
'use server';

import { db } from '@/lib/db';
import { pegawai } from '@/lib/db/schema';
import { pegawaiFormSchema } from '@/lib/schema-validation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createPegawai(data: unknown) {
  try {
    // Validate the form data
    const validatedData = pegawaiFormSchema.parse(data);

    // Insert into database
    const result = await db.insert(pegawai).values({
      nip: validatedData.nip,
      nama: validatedData.nama,
      status: validatedData.status,
    }).returning();

    // Revalidate the cache
    revalidatePath('/pegawai');

    return {
      success: true,
      data: result[0],
      message: 'Employee created successfully'
    };
  } catch (error) {
    console.error('Error creating employee:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten()
      };
    }

    // Handle unique constraint violation (duplicate NIP)
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return {
        success: false,
        errors: [{ path: 'nip', message: 'NIP already exists' }]
      };
    }

    return {
      success: false,
      errors: [{ path: 'root', message: 'Failed to create employee' }]
    };
  }
}