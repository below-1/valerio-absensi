"use client";

import React, { useEffect, useState, useTransition } from "react";
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

const absensiSchema = z.object({
  pegawaiId: z.number().min(1, "Pilih pegawai"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),

  stMasuk: z.boolean().optional(),
  stKeluar: z.boolean().optional(),

  jamMasuk: z.string().optional(),
  jamKeluar: z.string().optional(),
  
  statusMasuk: z.enum(statusMasukEnum).optional(),
  statusKeluar: z.enum(statusKeluarEnum).optional(),

  suratDispensasi: z.string().optional(),
  pengumpulanSuratDispensasi: z.string().optional(),
});

export type AbsensiFormData = z.infer<typeof absensiSchema>;

interface AddAbsensiModalProps {
  pegawaiOptions: { id: number; nama: string }[];
}

const statusMasukOptions = statusMasukEnum
const statusKeluarOptions = statusKeluarEnum;

export const AddAbsensiModal: React.FC<AddAbsensiModalProps> = ({
  pegawaiOptions,
}) => {
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

  const [stMasuk, stKeluar] = watch(["stMasuk", "stKeluar"]);

  useEffect(() => {
    if (stMasuk) {
      setValue("jamMasuk", undefined);
      setValue("statusMasuk", "tepat_waktu");
    } else {
      setValue("statusMasuk", undefined);
    }

    if (stKeluar) {
      setValue("jamKeluar", undefined);
      setValue("statusKeluar", "tepat_waktu");
    } else {
      setValue("statusKeluar", undefined);
    }
  }, [stMasuk, stKeluar, setValue]);

  const onSubmit = (data: AbsensiFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, String(v));
      });

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
        <Button>Tambah Absensi</Button>
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

          {/* ST Masuk dan keluar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="stMasuk" 
                checked={stMasuk} 
                onCheckedChange={e => {
                  setValue("stMasuk", Boolean(e))
                }}
              />
              <Label htmlFor="stMasuk">Surat Tugas Masuk</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="stKeluar"
                checked={stKeluar} 
                onCheckedChange={e => {
                  setValue("stKeluar", Boolean(e))
                }}
              />
              <Label htmlFor="stKeluar">Surat Tugas Keluar</Label>
            </div>
          </div>

          {/* Jam Masuk & Keluar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jamMasuk">Jam Masuk</Label>
              <Input 
                id="jamMasuk" 
                type="time" 
                {...register("jamMasuk")} 
                disabled={stMasuk}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jamKeluar">Jam Keluar</Label>
              <Input 
                id="jamKeluar" 
                type="time" 
                {...register("jamKeluar")} 
                disabled={stKeluar}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status Masuk */}
            <div className="space-y-2">
              <Label>Status Masuk</Label>
              <Select value={watch("statusMasuk")} onValueChange={(v) => setValue("statusMasuk", v as StatusMasuk)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status masuk" />
                </SelectTrigger>
                <SelectContent>
                  {statusMasukOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.statusMasuk && (
                <p className="text-red-500 text-sm">
                  {errors.statusMasuk.message}
                </p>
              )}
            </div>
            {/* Status Keluar */}
            <div className="space-y-2">
              <Label>Status Keluar</Label>
              <Select value={watch("statusKeluar")} onValueChange={(v) => setValue("statusKeluar", v as StatusKeluar)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status keluar (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {statusKeluarOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          


          {/* Surat Dispensasi */}
          <div className="space-y-2">
            <Label htmlFor="suratDispensasi">Surat Dispensasi</Label>
            <Textarea
              id="suratDispensasi"
              {...register("suratDispensasi")}
              placeholder="Keterangan surat dispensasi (opsional)"
            />
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
