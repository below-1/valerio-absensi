import { useMemo } from "react";
import { calculateAbsensiKeluarScore, calculateAbsensiMasukScore, getWeekday, PresensiType, timeStringToMinutes } from "./utils";

export const useWeekDay = (tanggal: string) => {
  const wd = useMemo(
    () => getWeekday(new Date(tanggal)), 
    [ tanggal ]);
  return wd;
}

export const useScoreMasuk = (presensiMasuk: PresensiType, jamMasuk: string | null) => {
  const scoreMasuk = useMemo(() => {
    return calculateAbsensiMasukScore({
      presensi: presensiMasuk,
      jamMasuk: jamMasuk ? timeStringToMinutes(jamMasuk) : null,
    })
  }, [ presensiMasuk, jamMasuk ])
  return scoreMasuk
}

export const useScoreKeluar = (presensiMasuk: PresensiType, presensiKeluar: PresensiType, jamMasuk: string | null, jamKeluar: string | null, weekday: number) => {
  const scoreKeluar = useMemo(() => {
    return calculateAbsensiKeluarScore({
      presensiMasuk: presensiMasuk,
      presensiKeluar: presensiKeluar,
      jamMasuk: jamMasuk ? timeStringToMinutes(jamMasuk) : null,
      jamKeluar: jamKeluar ? timeStringToMinutes(jamKeluar) : null,
      weekday
    })
  }, [ presensiKeluar, presensiMasuk, jamMasuk, jamKeluar, weekday ]);
  return scoreKeluar
}
