'use client';

import React, { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { EditAbsensiModal } from "@/components/edit-absensi-modal";
import { AbsensiFormData } from "@/components/add-rekap-modal";
import { DeleteModal } from "../../../rekapan/delete-modal";

// Types
type StatusMasuk = "tepat_waktu" | "telat" | "alfa" | null;
type StatusKeluar = "tepat_waktu" | "terlalu_cepat" | null;

type Row = {
  pegawaiId: number;
  nip: string;
  nama: string;
  absensiId: number | null;
  tanggal: string | null;
  jamMasuk: number | null;
  jamKeluar: number | null;
  statusMasuk: StatusMasuk;
  statusKeluar: StatusKeluar;
  presensiMasuk: AbsensiFormData["presensiMasuk"];
  presensiKeluar: AbsensiFormData["presensiKeluar"];
  suratDispensasi: string | null;
  scoreMasuk: number;
  scoreKeluar: number;
  totalScore: number;
  dispensasi?: boolean;
  pengumpulanSuratDispensasi: string | null;
};

// Helpers
const minutesToHHMM = (mins: number | null) => {
  if (mins == null) return "-";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const statusBadge = (s: StatusMasuk | StatusKeluar | null) => {
  if (!s) return <Badge variant="secondary">—</Badge>;
  switch (s) {
    case "tepat_waktu":
      return <Badge variant="default">Tepat Waktu</Badge>;
    case "telat":
      return <Badge variant="destructive">Telat</Badge>;
    case "alfa":
      return <Badge variant="destructive">Alfa</Badge>;
    case "terlalu_cepat":
      return <Badge variant="secondary">Terlalu Cepat</Badge>;
    default:
      return <Badge variant="secondary">{String(s)}</Badge>;
  }
};

type Props = {
  results: Row[];
}

// Component
export default function PegawaiAbsenPerMonth({ results }: Props) {
  const [query, setQuery] = useState("");

  const filtered = results.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.nama.toLowerCase().includes(q) || r.nip.toLowerCase().includes(q);
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAbsensi, setSelectedAbsensi] = useState<Row | undefined>();
  const passedData = useMemo(() => {
    return selectedAbsensi ? {
      ...selectedAbsensi,
      id: selectedAbsensi.absensiId!,
      jamMasuk: minutesToHHMM(selectedAbsensi.jamMasuk),
      jamKeluar: minutesToHHMM(selectedAbsensi.jamKeluar),
      tanggal: selectedAbsensi.tanggal ?? "",
      statusMasuk: selectedAbsensi.statusMasuk ?? "tepat_waktu",
      statusKeluar: selectedAbsensi.statusKeluar ?? "tepat_waktu",
    } : undefined;
  }, [ selectedAbsensi ])

  const onDelete = () => {

  }

  return (
    <>

      <Card className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle>Daftar Pegawai & Absensi</CardTitle>
            <p className="text-sm text-muted-foreground">Data absensi pegawai (tanpa grouping)</p>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Masuk</TableHead>
                <TableHead>Keluar</TableHead>
                <TableHead>Status Masuk</TableHead>
                <TableHead>Status Keluar</TableHead>
                <TableHead>Dispensasi</TableHead>
                <TableHead>In</TableHead>
                <TableHead>Out</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.absensiId ?? `pegawai-${r.pegawaiId}`}>
                    <TableCell>{r.tanggal ?? "-"}</TableCell>
                    <TableCell>{minutesToHHMM(r.jamMasuk)}</TableCell>
                    <TableCell>{minutesToHHMM(r.jamKeluar)}</TableCell>
                    <TableCell>{statusBadge(r.statusMasuk)}</TableCell>
                    <TableCell>{statusBadge(r.statusKeluar)}</TableCell>
                    <TableCell>{r.suratDispensasi ?? "-"}</TableCell>
                    <TableCell>{r.scoreMasuk}</TableCell>
                    <TableCell>{r.scoreKeluar}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}