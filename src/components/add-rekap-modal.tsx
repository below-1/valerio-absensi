"use client";

import React, { useState, useTransition } from "react";
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
import { addAbsensi } from "@/lib/actions/add-absensi";
import { StatusKeluar, statusKeluarEnum, StatusMasuk, statusMasukEnum } from "@/lib/db/schema";
import { toast } from "sonner";

const absensiSchema = z.object({
  pegawaiId: z.number().min(1, "Pilih pegawai"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jamMasuk: z.string().optional(),
  jamKeluar: z.string().optional(),
  statusMasuk: z.enum(statusMasukEnum),
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
    setValue,
    reset,
    formState: { errors },
  } = useForm<AbsensiFormData>({
    resolver: zodResolver(absensiSchema),
    defaultValues: { pegawaiId: 0, tanggal: "", statusMasuk: "tepat_waktu" },
  });

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
              <SelectTrigger>
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

          {/* Jam Masuk & Keluar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jamMasuk">Jam Masuk</Label>
              <Input id="jamMasuk" type="time" {...register("jamMasuk")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jamKeluar">Jam Keluar</Label>
              <Input id="jamKeluar" type="time" {...register("jamKeluar")} />
            </div>
          </div>

          {/* Status Masuk */}
          <div className="space-y-2">
            <Label>Status Masuk</Label>
            <Select onValueChange={(v) => setValue("statusMasuk", v as StatusMasuk)}>
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
            <Select onValueChange={(v) => setValue("statusKeluar", v as StatusKeluar)}>
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
