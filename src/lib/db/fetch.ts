import { db } from "../db";
import { pegawai } from "./schema";

export async function fetchPegawaiOptions() {
  const pegawaiOptions = await db.select({
    id: pegawai.id,
    nama: pegawai.nama,
  }).from(pegawai);
  return pegawaiOptions
}