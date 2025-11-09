import { and, asc, count, eq, like, sql } from "drizzle-orm";
import { db } from "../db";
import { absensi, pegawai } from "./schema";
import { splitDateString } from "../utils";

export async function fetchPegawai(id: number) {
  const r = await db.select().from(pegawai).where(eq(pegawai.id, id));
  if (!r[0]) throw new Error("can't find pegawai with id = " + id);
  return r[0];
}

export async function fetchPegawaiOptions() {
  const pegawaiOptions = await db.select({
    id: pegawai.id,
    nama: pegawai.nama,
  }).from(pegawai).orderBy(asc(pegawai.nama));
  return pegawaiOptions
}


export async function fetchRekapanAbsenByDay(dayFilter: string) {
  const [ year, month, day ] = splitDateString(dayFilter);
  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  const prefix = `${year}-${monthStr}-${dayStr}`;

  const results = await db.select({
    pegawaiId: pegawai.id,
    nip: pegawai.nip,
    nama: pegawai.nama,
    absensiId: absensi.id,
    tanggal: absensi.tanggal,
    jamMasuk: absensi.jamMasuk,
    jamKeluar: absensi.jamKeluar,
    scoreMasuk: absensi.scoreMasuk,
    scoreKeluar: absensi.scoreKeluar,
    totalScore: absensi.totalScore,
    dispensasi: absensi.dispensasi,
    statusMasuk: absensi.statusMasuk,
    statusKeluar: absensi.statusKeluar,
    suratDispensasi: absensi.suratDispensasi,
    pengumpulanSuratDispensasi: absensi.pengumpulanSuratDispensasi,
  })
    .from(pegawai)
    .leftJoin(
      absensi,
      sql`${absensi.pegawaiId} = ${pegawai.id} AND ${absensi.tanggal} LIKE ${prefix + "%"}`
    )
    .orderBy(pegawai.nama, absensi.tanggal);
  return results;
}

export async function fetchRekapanAbsenByMonthAndPegawai(
  monthFilter: string, 
  pegawaiId: number
) {

  const results = await db.select({
    // Pegawai fields (from left join)
    pegawaiId: pegawai.id,
    nip: pegawai.nip,
    nama: pegawai.nama,
    
    // Absensi fields (primary table)
    absensiId: absensi.id,
    tanggal: absensi.tanggal,
    jamMasuk: absensi.jamMasuk,
    jamKeluar: absensi.jamKeluar,
    scoreMasuk: absensi.scoreMasuk,
    scoreKeluar: absensi.scoreKeluar,
    totalScore: absensi.totalScore,
    dispensasi: absensi.dispensasi,
    statusMasuk: absensi.statusMasuk,
    statusKeluar: absensi.statusKeluar,
    suratDispensasi: absensi.suratDispensasi,
    pengumpulanSuratDispensasi: absensi.pengumpulanSuratDispensasi,
  })
    .from(absensi) // Select from absensi as primary table
    .leftJoin(
      pegawai,
      eq(absensi.pegawaiId, pegawai.id) // Join condition
    )
    .where(
      and(
        eq(absensi.pegawaiId, pegawaiId), // Filter by pegawaiId
        like(absensi.tanggal, `${monthFilter}%`) // Filter by month
      )
    )
    .orderBy(absensi.tanggal);
  
  return results;
}

export async function fetchRekapanAbsenByMonth(monthFilter: string) {
  const results = await db
    .select({
      pegawaiId: pegawai.id,
      nip: pegawai.nip,
      namaPegawai: pegawai.nama,
      totalHari: sql<number>`COUNT(${absensi.id})`,

      // 🕒 Total "In" score
      totalInScore: sql<number>`
        SUM(${absensi.scoreMasuk})
      `.as("total_in_score"),

      rataRataIn: sql<number>`
        ROUND(AVG(
          ${absensi.scoreMasuk}
        ), 2)
      `.as("rata_rata_in"),

      // 🕔 Total "Out" score
      totalOutScore: sql<number>`
        SUM(
          ${absensi.scoreKeluar}
        )
      `.as("total_out_score"),

      rataRataOut: sql<number>`
        ROUND(AVG(
          ${absensi.scoreKeluar}
        ), 2)
      `.as("rata_rata_out"),
    })
    .from(pegawai)
    .leftJoin(
      absensi,
      sql`${absensi.pegawaiId} = ${pegawai.id} AND strftime('%Y-%m', ${absensi.tanggal}) = ${monthFilter}`
    )
    .groupBy(pegawai.id, pegawai.nip, pegawai.nama)
    .orderBy(pegawai.nama);
  const mapped = results.map(r => {
    return {
      ...r,
      totalScore: (r.totalInScore + r.totalOutScore)
    }
  })
  return mapped;
}

interface AttendanceStats {
  totals: {
    tepatWaktuMasuk: number;
    telat: number;
    terlaluCepat: number;
    alfa: number;
    tepatWaktuKeluar: number;
  };
  percentages: {
    tepatWaktuMasuk: number;
    telat: number;
    terlaluCepat: number;
    alfa: number;
    tepatWaktuKeluar: number;
  };
  totalRecords: number;
}


export async function calculateAttendanceStatsDrizzle(
  monthFilter?: string
): Promise<AttendanceStats> {
  // Build where condition for month filter
  let whereCondition = undefined;

  if (monthFilter) {
    // Validate the monthFilter format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(monthFilter)) {
      throw new Error('monthFilter must be in YYYY-MM format');
    }

    // Create condition to filter records for the specific month
    whereCondition = sql`${absensi.tanggal} LIKE ${monthFilter + '%'}`;
  }

  // Single query using conditional aggregation with Drizzle
  const [result] = await db
    .select({
      totalRecords: count(),
      tepatWaktuMasuk: sql<number>`sum(case when ${absensi.statusMasuk} = 'tepat_waktu' then 1 else 0 end)`,
      telat: sql<number>`sum(case when ${absensi.statusMasuk} = 'telat' then 1 else 0 end)`,
      alfa: sql<number>`sum(case when ${absensi.statusMasuk} = 'alfa' then 1 else 0 end)`,
      terlaluCepat: sql<number>`sum(case when ${absensi.statusKeluar} = 'terlalu_cepat' then 1 else 0 end)`,
      tepatWaktuKeluar: sql<number>`sum(case when ${absensi.statusKeluar} = 'tepat_waktu' then 1 else 0 end)`,
    })
    .from(absensi)
    .where(whereCondition);

  const totalRecords = result.totalRecords || 0;

  // Calculate percentages
  const calculatePercentage = (count: number): number => {
    return totalRecords > 0 ? Math.round((count / totalRecords) * 100 * 100) / 100 : 0;
  };

  return {
    totals: {
      tepatWaktuMasuk: result.tepatWaktuMasuk || 0,
      telat: result.telat || 0,
      terlaluCepat: result.terlaluCepat || 0,
      alfa: result.alfa || 0,
      tepatWaktuKeluar: result.tepatWaktuKeluar || 0,
    },
    percentages: {
      tepatWaktuMasuk: calculatePercentage(result.tepatWaktuMasuk || 0),
      telat: calculatePercentage(result.telat || 0),
      terlaluCepat: calculatePercentage(result.terlaluCepat || 0),
      alfa: calculatePercentage(result.alfa || 0),
      tepatWaktuKeluar: calculatePercentage(result.tepatWaktuKeluar || 0),
    },
    totalRecords
  };
}