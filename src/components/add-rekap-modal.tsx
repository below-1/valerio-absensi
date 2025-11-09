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
import { set, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addAbsensi } from "@/lib/actions/add-absensi";
import { StatusKeluar, statusKeluarEnum, StatusMasuk, statusMasukEnum } from "@/lib/db/schema";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { calculateAbsensiKeluarScore, calculateAbsensiMasukScore, calculateStatusKeluar, calculateStatusMasuk, getWeekday, PresensiStatusEnum, presensiStatusOptions, PresensiType, timeStringToMinutes } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import { Badge } from "./ui/badge";
import { useScoreKeluar, useScoreMasuk, useWeekDay } from "@/lib/hooks";
import { Plus } from "lucide-react";

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

// In your AddAbsensiModal component, add this prop
interface AddAbsensiModalProps {
  pegawaiOptions: {
    id: number;
    nama: string;
  }[];
  variant?: "default" | "icon" | "full";
}

const statusMasukOptions = statusMasukEnum
const statusKeluarOptions = statusKeluarEnum;

export function AddAbsensiModal({ pegawaiOptions, variant = "default" }: AddAbsensiModalProps) {
  const [open, setOpen] = useState(false);
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
      pegawaiId: 0,
      tanggal: "",
      statusMasuk: "tepat_waktu",
      stMasuk: false,
      stKeluar: false,
    },
  });

  const [
    presensiMasuk,
    presensiKeluar,
    jamMasuk,
    jamKeluar,
    tanggal
  ] = watch(["presensiMasuk", "presensiKeluar", 'jamMasuk', 'jamKeluar', "tanggal"]);

  const weekDay = useWeekDay(tanggal);
  const scoreMasuk = useScoreMasuk(presensiMasuk, jamMasuk ?? null);
  const scoreKeluar = useScoreKeluar(presensiMasuk, presensiKeluar, jamMasuk ?? null, jamKeluar ?? null, weekDay);
  const statusMasuk = useMemo(() => calculateStatusMasuk(presensiMasuk, scoreMasuk), [ presensiMasuk, scoreMasuk ]);
  const statusKeluar = useMemo(() => calculateStatusKeluar(presensiKeluar, scoreKeluar), [ presensiKeluar, scoreKeluar ]);

  useEffect(() => {
    console.log("Score Masuk:", scoreMasuk);
    console.log("Score Keluar:", scoreKeluar);
  }, [scoreMasuk, scoreKeluar]);

  const onSubmit = (data: AbsensiFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });
      formData.append("statusMasuk", statusMasuk);
      formData.append("statusKeluar", statusKeluar);
      formData.append("totalScore", String(scoreMasuk + scoreKeluar));
      formData.append("scoreMasuk", String(scoreMasuk));
      formData.append("scoreKeluar", String(scoreKeluar));

      const result = await addAbsensi(formData);
      if (result) {
        if (!result.success) {
          const message = typeof result.error === "string" ? result.error : "Gagal menambahkan absensi. Silakan coba lagi.";
          toast.error(message);
          return;
        }
      }
      toast.success("Sukses menambahkan absensi.");
      reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button size="icon" variant="outline" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        ) : variant === "full" ? (
          <Button className="w-full" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Absensi
          </Button>
        ) : (
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Absensi
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Data Absensi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Pegawai */}
          <div className="space-y-2">
            <Label htmlFor="pegawaiId">Pegawai</Label>
            <Select onValueChange={(v) => setValue("pegawaiId", Number(v))}>
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
          <div className="space-y-2">
            <Checkbox
              id="dispensasi"
              name="dispensasi"
              checked={watch("dispensasi") || false}
              onCheckedChange={(checked) => setValue("dispensasi", Boolean(checked))}
            />
            <Label htmlFor="suratDispensasi">Butuh Surat Dispensasi</Label>
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
