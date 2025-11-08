import { asc, sql } from "drizzle-orm";
import { db } from "../db";
import { absensi, pegawai } from "./schema";
import { splitDateString } from "../utils";

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