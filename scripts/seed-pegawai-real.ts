// lib/seed-pegawai.ts
import { db } from '@/lib/db'; // Your drizzle database instance
import { pegawai } from '@/lib/db/schema'; // Your schema file
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

interface CsvPegawai {
  nip: string;
  nama: string;
  status: string;
}

export async function seedPegawaiFromCsv(filePath: string): Promise<{ success: number; errors: string[] }> {
  const results: CsvPegawai[] = [];
  const errors: string[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({
        headers: ['nip', 'nama', 'status'], // Map CSV columns to object properties
        separator: ',', // CSV delimiter
        mapHeaders: ({ header, index }) => header.trim(), // Clean header names
        mapValues: ({ value }) => value.trim(), // Clean values
      }))
      .on('data', (data) => {
        // Validate required fields
        if (!data.nip || !data.nama || !data.status) {
          errors.push(`Missing required fields for row: ${JSON.stringify(data)}`);
          return;
        }
        results.push(data as CsvPegawai);
      })
      .on('end', async () => {
        try {
          let successCount = 0;

          // Insert data in batches to avoid overwhelming the database
          const batchSize = 100;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            
            try {
              await db.insert(pegawai).values(
                batch.map(row => ({
                  nip: row.nip,
                  nama: row.nama,
                  status: row.status,
                }))
              );
              successCount += batch.length;
            } catch (batchError) {
              // If batch insert fails, try individual inserts to identify problematic rows
              for (const row of batch) {
                try {
                  await db.insert(pegawai).values({
                    nip: row.nip,
                    nama: row.nama,
                    status: row.status,
                  });
                  successCount++;
                } catch (individualError) {
                  errors.push(`Failed to insert ${row.nip}: ${individualError}`);
                }
              }
            }
          }

          resolve({
            success: successCount,
            errors
          });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Alternative function using fs.readFileSync for simpler CSV parsing
export async function seedPegawaiFromCsvSimple(filePath: string): Promise<{ success: number; errors: string[] }> {
  const errors: string[] = [];
  let successCount = 0;

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      try {
        // Parse CSV line, handling quoted fields
        const regex = /(?:,|^)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
        const matches = [];
        let match;

        while ((match = regex.exec(line)) !== null) {
          matches.push(match[1] || match[2]);
        }

        const [nip, nama, status] = matches;

        if (!nip || !nama || !status) {
          errors.push(`Missing required fields in line: ${line}`);
          continue;
        }

        // Insert into database
        await db.insert(pegawai).values({
          nip: nip.trim(),
          nama: nama.trim(),
          status: status.trim(),
        });

        successCount++;
      } catch (lineError) {
        errors.push(`Failed to process line: ${line} - Error: ${lineError}`);
      }
    }

    return { success: successCount, errors };
  } catch (error) {
    throw new Error(`Failed to read CSV file: ${error}`);
  }
}

// Utility function to run the seed
export async function runSeed() {
  const csvFilePath = path.join(process.cwd(), 'scripts', 'pegawai.csv'); // Adjust path as needed
  
  try {
    console.log('Starting seed process...');
    const result = await seedPegawaiFromCsv(csvFilePath);
    
    console.log(`Seed completed!`);
    console.log(`Successfully inserted: ${result.success} records`);
    
    if (result.errors.length > 0) {
      console.log(`Errors encountered: ${result.errors.length}`);
      result.errors.forEach(error => console.log(`- ${error}`));
    }
    
    return result;
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

runSeed();