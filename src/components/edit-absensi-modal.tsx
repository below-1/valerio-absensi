"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { editAbsensi } from "@/lib/actions/edit-absensi";
import { StatusKeluar, statusKeluarEnum, StatusMasuk, statusMasukEnum } from "@/lib/db/schema";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { calculateAbsensiKeluarScore, calculateAbsensiMasukScore, calculateStatusKeluar, calculateStatusMasuk, getWeekday, PresensiStatusEnum, presensiStatusOptions, PresensiType, timeStringToMinutes } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import { Badge } from "./ui/badge";
import { useScoreKeluar, useScoreMasuk, useWeekDay } from "@/lib/hooks";

const absensiSchema = z.object({
  pegawaiId: z.number().min(1, "Pilih pegawai"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),

  presensiMasuk: PresensiStatusEnum,
  presensiKeluar: PresensiStatusEnum,

  stMasuk: z.boolean().optional(),
  stKeluar: z.boolean().optional(),

  jamMasuk: z.string().optional(),
  jamKeluar: z.string().optional(),

  statusMasuk: z.enum(statusMasukEnum).optional(),
  statusKeluar: z.enum(statusKeluarEnum).optional(),

  dispensasi: z.boolean().optional(),

  suratDispensasi: z.string().optional(),
  pengumpulanSuratDispensasi: z.string().optional(),
});

export type AbsensiFormData = z.infer<typeof absensiSchema>;

interface EditAbsensiModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pegawaiOptions: { id: number; nama: string }[];
  absensiData: {
    id: number;
    pegawaiId: number;
    tanggal: string;
    presensiMasuk: PresensiType;
    presensiKeluar: PresensiType;
    jamMasuk?: string | null;
    jamKeluar?: string | null;
    stMasuk?: boolean;
    stKeluar?: boolean;
    dispensasi?: boolean;
    suratDispensasi?: string | null;
    pengumpulanSuratDispensasi?: string | null;
    statusMasuk?: StatusMasuk;
    statusKeluar?: StatusKeluar;
  };
  onSuccess?: () => void;
}

const statusMasukOptions = statusMasukEnum
const statusKeluarOptions = statusKeluarEnum;

export const EditAbsensiModal: React.FC<EditAbsensiModalProps> = ({
  pegawaiOptions,
  absensiData,
  onSuccess,
  open,
  setOpen
}) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AbsensiFormData>({
    resolver: zodResolver(absensiSchema),
    defaultValues: {
      pegawaiId: absensiData.pegawaiId,
      tanggal: absensiData.tanggal,
      presensiMasuk: absensiData.presensiMasuk,
      presensiKeluar: absensiData.presensiKeluar,
      jamMasuk: absensiData.jamMasuk || "",
      jamKeluar: absensiData.jamKeluar || "",
      stMasuk: absensiData.stMasuk || false,
      stKeluar: absensiData.stKeluar || false,
      dispensasi: absensiData.dispensasi || false,
      suratDispensasi: absensiData.suratDispensasi || "",
      pengumpulanSuratDispensasi: absensiData.pengumpulanSuratDispensasi || "",
      statusMasuk: absensiData.statusMasuk || "tepat_waktu",
    },
  });

  const [
    presensiMasuk,
    presensiKeluar,
    jamMasuk,
    jamKeluar,
    tanggal
  ] = watch(["presensiMasuk", "presensiKeluar", 'jamMasuk', 'jamKeluar', "tanggal"]);

  useEffect(() => {
    console.log("jamMasuk", jamMasuk)
    console.log("jamKeluar", jamKeluar)
  }, [ jamMasuk, jamKeluar ])

  const weekDay = useWeekDay(tanggal);
  const scoreMasuk = useScoreMasuk(presensiMasuk, jamMasuk ?? null);
  const scoreKeluar = useScoreKeluar(presensiMasuk, presensiKeluar, jamMasuk ?? null, jamKeluar ?? null, weekDay);
  const statusMasuk = useMemo(() => calculateStatusMasuk(presensiMasuk, scoreMasuk), [ presensiMasuk, scoreMasuk ]);
  const statusKeluar = useMemo(() => calculateStatusKeluar(presensiKeluar, scoreKeluar), [ presensiKeluar, scoreKeluar ]);

  useEffect(() => {
    console.log("Score Masuk:", scoreMasuk);
    console.log("Score Keluar:", scoreKeluar);
  }, [scoreMasuk, scoreKeluar]);

  // Reset form when modal opens or absensiData changes
  useEffect(() => {
    if (open) {
      reset({
        pegawaiId: absensiData.pegawaiId,
        tanggal: absensiData.tanggal,
        presensiMasuk: absensiData.presensiMasuk,
        presensiKeluar: absensiData.presensiKeluar,
        jamMasuk: absensiData.jamMasuk || "",
        jamKeluar: absensiData.jamKeluar || "",
        stMasuk: absensiData.stMasuk || false,
        stKeluar: absensiData.stKeluar || false,
        dispensasi: absensiData.dispensasi || false,
        suratDispensasi: absensiData.suratDispensasi || "",
        pengumpulanSuratDispensasi: absensiData.pengumpulanSuratDispensasi || "",
        statusMasuk: absensiData.statusMasuk || "tepat_waktu",
      });
    }
  }, [open, absensiData, reset]);

  const onSubmit = (data: AbsensiFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", String(absensiData.id));
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });
      formData.append("statusMasuk", statusMasuk);
      formData.append("statusKeluar", statusKeluar);
      formData.append("totalScore", String(scoreMasuk + scoreKeluar));
      formData.append("scoreMasuk", String(scoreMasuk));
      formData.append("scoreKeluar", String(scoreKeluar));

      const result = await editAbsensi(formData);
      if (result) {
        if (!result.success) {
          const message = typeof result.error === "string" ? result.error : "Gagal mengupdate absensi. Silakan coba lagi.";
          toast.error(message);
          return;
        }
      }
      toast.success("Sukses mengupdate absensi.");
      reset();
      setOpen(false);
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Data Absensi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Pegawai */}
          <div className="space-y-2">
            <Label htmlFor="pegawaiId">Pegawai</Label>
            <Select 
              value={String(watch("pegawaiId"))} 
              onValueChange={(v) => setValue("pegawaiId", Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih pegawai" />
              </SelectTrigger>
              <SelectContent>
                {pegawaiOptions.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pegawaiId && (
              <p className="text-red-500 text-sm">{errors.pegawaiId.message}</p>
            )}
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal</Label>
            <Input id="tanggal" type="date" {...register("tanggal")} />
            {errors.tanggal && (
              <p className="text-red-500 text-sm">{errors.tanggal.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status Masuk */}
            <div className="space-y-2">
              <Label>Presensi Masuk</Label>
              <Select
                value={watch("presensiMasuk")}
                onValueChange={(v) => setValue("presensiMasuk", v as PresensiType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status masuk" />
                </SelectTrigger>
                <SelectContent>
                  {presensiStatusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.presensiMasuk && (
                <p className="text-red-500 text-sm">
                  {errors.presensiMasuk.message}
                </p>
              )}
            </div>
            {/* Status Keluar */}
            <div className="space-y-2">
              <Label>Presensi Keluar</Label>
              <Select
                value={watch("presensiKeluar")}
                onValueChange={(v) => setValue("presensiKeluar", v as PresensiType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih presensi keluar" />
                </SelectTrigger>
                <SelectContent>
                  {presensiStatusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jam Masuk & Keluar */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className={twMerge(
                "space-y-2",
                presensiMasuk == "masuk" ? "visible" : "invisible"
              )}
            >
              <Label htmlFor="jamMasuk">Jam Masuk</Label>
              <Input
                id="jamMasuk"
                type="time"
                {...register("jamMasuk")}
              />
            </div>
            <div
              className={twMerge(
                "space-y-2",
                presensiKeluar == "masuk" ? "visible" : "invisible"
              )}
            >
              <Label htmlFor="jamKeluar">Jam Keluar</Label>
              <Input
                id="jamKeluar"
                type="time"
                {...register("jamKeluar")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base">Score {scoreMasuk}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base">Score {scoreKeluar}</Badge>
            </div>
          </div>

          {/* Surat Dispensasi */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dispensasi"
              checked={watch("dispensasi") || false}
              onCheckedChange={(checked) => setValue("dispensasi", Boolean(checked))}
            />
            <Label htmlFor="dispensasi">Butuh Surat Dispensasi</Label>
          </div>

          {/* Pengumpulan Surat Dispensasi */}
          <div className="space-y-2">
            <Label htmlFor="pengumpulanSuratDispensasi">
              Pengumpulan Surat Dispensasi
            </Label>
            <Textarea
              id="pengumpulanSuratDispensasi"
              {...register("pengumpulanSuratDispensasi")}
              placeholder="Keterangan pengumpulan surat dispensasi (opsional)"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};