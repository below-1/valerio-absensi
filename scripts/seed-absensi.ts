// lib/load-attendance-csv.ts
import { db } from "@/lib/db";
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { absensi, pegawai } from "@/lib/db/schema";
import { dayNameToNumber, normalizeTimeString, timeStringToMinutes } from "@/lib/utils";
import { format } from "date-fns";

// types/attendance.ts
export interface AttendanceRecord {
  nip: string;
  hari: string;
  tanggal: string;
  masuk: string;
  keluar: string;
  tepatWaktu: string;
  telat: string;
  alfa: string;
  tepatWaktuPulang: string;
  terlaluCepat: string;
  suratDispensasi: string;
  pengumpulanSuratDispensasi: string;
  in: string;
  out: string;
}

export interface ProcessedAttendanceRecord {
  nip: string;
  hari: number;
  tanggal: Date;
  masuk: string;
  keluar: string;
  tepatWaktu: boolean;
  telat: boolean;
  alfa: boolean;
  tepatWaktuPulang: boolean;
  terlaluCepat: boolean;
  suratDispensasi: boolean;
  pengumpulanSuratDispensasi: boolean;
  in: number;
  out: number;
}

export async function loadAttendanceFromCsv(filePath: string): Promise<{
  records: ProcessedAttendanceRecord[];
  errors: string[];
}> {
  const records: AttendanceRecord[] = [];
  const processedRecords: any[] = [];
  const errors: string[] = [];

  const ps = await db.select().from(pegawai).all();

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({
        headers: [
          'nip',
          'hari', 
          'tanggal',
          'masuk',
          'keluar',
          'tepatWaktu',
          'telat',
          'alfa',
          'tepatWaktuPulang',
          'terlaluCepat',
          'suratDispensasi',
          'pengumpulanSuratDispensasi',
          'in',
          'out'
        ],
        mapHeaders: ({ header, index }) => header.trim(),
        mapValues: ({ value }) => value.trim(),
      }))
      .on('data', (data) => {
        // Validate required fields
        if (!data.nip || !data.tanggal) {
          errors.push(`Missing required fields for row: ${JSON.stringify(data)}`);
          return;
        }
        records.push(data as AttendanceRecord);
      })
      .on('end', async () => {
        try {
          // Process and transform the data
          const absensi_list: any[] = []
          for (const record of records) {
            try {
              const processedRecord = transformAttendanceRecord(record);
              const fp = ps.find(p => p.nip == processedRecord.nip)
              if (!fp) {
                throw new Error("pegawai not found")
              }
              const xp = {
                ...processedRecord,
                pegawaiId: fp?.id
              };
              let statusMasuk = "";
              let statusKeluar = "";

              if (xp.masuk == 'ST') {
                statusMasuk = 'surat_tugas';
              }
              if (xp.tepatWaktu) {
                statusMasuk = 'tepat_waktu';
              }
              if (xp.telat) {
                statusMasuk = 'telat';
              }
              if (xp.alfa) {
                statusMasuk = 'alfa';
              }

              if (xp.keluar == 'ST') {
                statusKeluar = 'surat_tugas';
              }
              if (xp.tepatWaktuPulang) {
                statusKeluar = 'tepat_waktu';
              }
              if (xp.terlaluCepat) {
                statusKeluar = 'terlalu_cepat';
              }

              if (!statusMasuk) throw new Error('status masuk is undefined');
              if (!statusKeluar) throw new Error('status keluar is undefined');

              const jamMasuk = xp.masuk == 'ST' ? null : (xp.masuk ? timeStringToMinutes(normalizeTimeString(xp.masuk)) : null);
              const jamKeluar = xp.keluar == 'ST' ? null : (xp.keluar ? timeStringToMinutes(normalizeTimeString(xp.keluar)) : null);
              

              const absensi = {
                pegawaiId: xp.pegawaiId,
                weekday: xp.hari,
                tanggal: format(xp.tanggal, 'yyyy-MM-dd'),
                jamMasuk,
                jamKeluar,
                statusMasuk,
                statusKeluar,
                scoreMasuk: xp.in,
                scoreKeluar: xp.out,
                dispensasi: xp.suratDispensasi,
                totalScore: xp.in + xp.out
              }
              absensi_list.push(absensi);
            } catch (error) {
              errors.push(`Failed to process record ${record.nip} - ${record.tanggal}: ${error}`);
            }
          }
          
          const batchSize = 10
          const totalBatches = Math.ceil(absensi_list.length / batchSize);

          console.log(absensi_list);
          console.log("absensi_list");
  
          for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = start + batchSize;
            const batch = absensi_list.slice(start, end);
            
            const r = await db.insert(absensi).values(batch).returning();
            console.log(r);
          }

          resolve({
            records: processedRecords,
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

function transformAttendanceRecord(record: AttendanceRecord): ProcessedAttendanceRecord {
  // Parse date from "1-Sep-25" format
  const parsedDate = parseDateString(record.tanggal);
  
  // Transform boolean fields (empty string = false, any value = true)
  const transformBoolean = (value: string): boolean => value !== '' && value !== '0';
  
  // Transform number fields
  const transformNumber = (value: string): number => {
    const num = parseInt(value);
    return isNaN(num) ? 0 : num;
  };

  return {
    nip: record.nip,
    hari: dayNameToNumber(record.hari),
    tanggal: parsedDate,
    masuk: record.masuk,
    keluar: record.keluar,
    tepatWaktu: transformBoolean(record.tepatWaktu),
    telat: transformBoolean(record.telat),
    alfa: transformBoolean(record.alfa),
    tepatWaktuPulang: transformBoolean(record.tepatWaktuPulang),
    terlaluCepat: transformBoolean(record.terlaluCepat),
    suratDispensasi: transformBoolean(record.suratDispensasi),
    pengumpulanSuratDispensasi: transformBoolean(record.pengumpulanSuratDispensasi),
    in: transformNumber(record.in),
    out: transformNumber(record.out)
  };
}

function parseDateString(dateStr: string): Date {
  // Handle formats like "1-Sep-25", "2-Sep-25", etc.
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  const day = parseInt(parts[0]);
  const monthStr = parts[1].toLowerCase();
  const year = parseInt(parts[2]) + 2000; // Convert "25" to 2025

  const monthMap: { [key: string]: number } = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  const month = monthMap[monthStr];
  if (month === undefined) {
    throw new Error(`Invalid month: ${monthStr}`);
  }

  if (isNaN(day) || isNaN(year)) {
    throw new Error(`Invalid day or year: ${dateStr}`);
  }

  return new Date(year, month, day);
}

async function runSeed() {
  const r = await loadAttendanceFromCsv("scripts/absensi.csv")
  console.log(r)
}

runSeed()