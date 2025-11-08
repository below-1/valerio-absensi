'use client';

import React, { useState } from "react";

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
import { DeleteModal } from "./delete-modal";

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
  suratDispensasi: string | null;
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

// Component
export default function RekapanTablePerDay({ results }: { results: Row[] }) {
  const [query, setQuery] = useState("");

  const filtered = results.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return r.nama.toLowerCase().includes(q) || r.nip.toLowerCase().includes(q);
  });

  const onDelete = () => {

  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <CardTitle>Daftar Pegawai & Absensi</CardTitle>
          <p className="text-sm text-muted-foreground">Data absensi pegawai (tanpa grouping)</p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari nama atau NIP..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[260px]"
          />
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
            }}
          >
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pegawai</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Masuk</TableHead>
              <TableHead>Keluar</TableHead>
              <TableHead>Status Masuk</TableHead>
              <TableHead>Status Keluar</TableHead>
              <TableHead>Surat Dispensasi</TableHead>
              <TableHead>Pengumpulan Surat</TableHead>
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
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{r.nama}</span>
                      <span className="text-sm text-muted-foreground">ID: {r.pegawaiId}</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.nip}</TableCell>
                  <TableCell>{r.tanggal ?? "-"}</TableCell>
                  <TableCell>{minutesToHHMM(r.jamMasuk)}</TableCell>
                  <TableCell>{minutesToHHMM(r.jamKeluar)}</TableCell>
                  <TableCell>{statusBadge(r.statusMasuk)}</TableCell>
                  <TableCell>{statusBadge(r.statusKeluar)}</TableCell>
                  <TableCell>{r.suratDispensasi ?? "-"}</TableCell>
                  <TableCell>{r.pengumpulanSuratDispensasi ?? "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => console.log("Edit", r)}>
                          Edit
                        </DropdownMenuItem>
                        {r.absensiId && (
                          <DropdownMenuItem asChild>
                            <DeleteModal
                              id={r.absensiId}
                            />
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}