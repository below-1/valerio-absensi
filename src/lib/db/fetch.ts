import { and, asc, eq, like, sql } from "drizzle-orm";
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
        SUM(
          CASE
            WHEN ${absensi.statusMasuk} = 'alfa' THEN -5
            WHEN ${absensi.jamMasuk} <= 450 THEN 5
            WHEN ${absensi.jamMasuk} BETWEEN 451 AND 480 THEN 3
            WHEN ${absensi.jamMasuk} BETWEEN 481 AND 510 THEN 2
            WHEN ${absensi.jamMasuk} > 510 THEN 1
            ELSE 0
          END
        )
      `.as("total_in_score"),

      rataRataIn: sql<number>`
        ROUND(AVG(
          CASE
            WHEN ${absensi.statusMasuk} = 'alfa' THEN -5
            WHEN ${absensi.jamMasuk} <= 450 THEN 5
            WHEN ${absensi.jamMasuk} BETWEEN 451 AND 480 THEN 3
            WHEN ${absensi.jamMasuk} BETWEEN 481 AND 510 THEN 2
            WHEN ${absensi.jamMasuk} > 510 THEN 1
            ELSE 0
          END
        ), 2)
      `.as("rata_rata_in"),

      // 🕔 Total "Out" score
      totalOutScore: sql<number>`
        SUM(
          CASE
            WHEN ${absensi.weekday} BETWEEN 1 AND 4 AND ${absensi.jamKeluar} >= 960 THEN 1
            WHEN ${absensi.weekday} = 5 AND ${absensi.jamKeluar} >= 990 THEN 1
            WHEN ${absensi.weekday} BETWEEN 1 AND 4 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) >= 510 THEN 1
            WHEN ${absensi.weekday} = 5 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) >= 540 THEN 1
            WHEN ${absensi.weekday} BETWEEN 1 AND 4 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) < 510 THEN -2
            WHEN ${absensi.weekday} = 5 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) < 540 THEN -2
            ELSE 0
          END
        )
      `.as("total_out_score"),

      rataRataOut: sql<number>`
        ROUND(AVG(
          CASE
            WHEN ${absensi.weekday} BETWEEN 1 AND 4 AND ${absensi.jamKeluar} >= 960 THEN 1
            WHEN ${absensi.weekday} = 5 AND ${absensi.jamKeluar} >= 990 THEN 1
            WHEN ${absensi.weekday} BETWEEN 1 AND 4 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) >= 510 THEN 1
            WHEN ${absensi.weekday} = 5 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) >= 540 THEN 1
            WHEN ${absensi.weekday} BETWEEN 1 AND 4 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) < 510 THEN -2
            WHEN ${absensi.weekday} = 5 AND (${absensi.jamKeluar} - ${absensi.jamMasuk}) < 540 THEN -2
            ELSE 0
          END
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
  console.log(mapped)
  console.log("mapped")
  return mapped;
}