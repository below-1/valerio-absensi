import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown } from "lucide-react";
import { StatusKeluar, StatusMasuk } from "@/lib/db/schema";

export type AbsensiItem = {
  pegawai: {
    id: number;
    nip: string;
    nama: string;
  };
  absensi?: {
    id: number;
    tanggal: string; // ISO date string
    jamMasuk?: number; // either epoch ms or minutes-since-midnight (helper will handle both)
    jamKeluar?: number;
    statusMasuk: StatusMasuk;
    statusKeluar?: StatusKeluar;
    suratDispensasi?: string;
    pengumpulanSuratDispensasi?: string;
  };
};

// Helper: format jamMasuk/jamKeluar robustly
function formatTime(value?: number) {
  if (value == null) return "-";
  // if looks like an epoch ms (>= 10^11 -> year >= 1973)
  if (value > 1e11) {
    try {
      const d = new Date(value);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return String(value);
    }
  }
  // if small number, interpret as minutes since midnight
  if (value >= 0 && value < 24 * 60) {
    const hh = Math.floor(value / 60)
      .toString()
      .padStart(2, "0");
    const mm = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${hh}:${mm}`;
  }
  // fallback: show raw
  return String(value);
}

function statusBadge(status: StatusMasuk | StatusKeluar | undefined) {
  if (!status) return <Badge variant="secondary">-</Badge>;
  const lower = String(status).toLowerCase();
  if (lower.includes("tepat_waktu")) return <Badge>Tepat Waktu</Badge>;
  if (lower.includes("telat")) return <Badge variant="destructive">Telat</Badge>;
  if (lower.includes("terlalu_cepat")) return <Badge variant="destructive">Terlalu Cepat</Badge>;
  if (lower.includes("izin") || lower.includes("sakit")) return <Badge variant="outline">{status}</Badge>;
  return <Badge>{status}</Badge>;
}

// Props
export default function AbsensiTable({ items }: { items: AbsensiItem[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortDesc, setSortDesc] = useState(true);

  // Filter & sort
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = items.slice();
    if (q) {
      arr = arr.filter((it) => {
        return (
          it.pegawai.nama.toLowerCase().includes(q) ||
          it.pegawai.nip.toLowerCase().includes(q) ||
          (it.absensi?.tanggal ?? "").toLowerCase().includes(q)
        );
      });
    }
    arr.sort((a, b) => {
      const ta = a.absensi?.tanggal ? Date.parse(a.absensi!.tanggal) : 0;
      const tb = b.absensi?.tanggal ? Date.parse(b.absensi!.tanggal) : 0;
      return sortDesc ? tb - ta : ta - tb;
    });
    return arr;
  }, [items, query, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function goto(newPage: number) {
    setPage(Math.min(Math.max(1, newPage), totalPages));
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle>Absensi</CardTitle>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Input
              placeholder="Cari nama / NIP / tanggal"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search size={16} />
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setSortDesc((s) => !s)}
            title="Sort by tanggal"
            aria-label="Toggle sort"
          >
            <ArrowUpDown size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Masuk</TableHead>
                <TableHead>Keluar</TableHead>
                <TableHead>Status Masuk</TableHead>
                <TableHead>Status Keluar</TableHead>
                <TableHead>Surat Dispensasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}

              {current.map((it, idx) => (
                <TableRow key={it.pegawai.id + "-" + (it.absensi?.id ?? idx)}>
                  <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                  <TableCell>{it.pegawai.nama}</TableCell>
                  <TableCell>{it.pegawai.nip}</TableCell>
                  <TableCell>
                    {it.absensi?.tanggal ? new Date(it.absensi.tanggal).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>{formatTime(it.absensi?.jamMasuk)}</TableCell>
                  <TableCell>{formatTime(it.absensi?.jamKeluar)}</TableCell>
                  <TableCell>{statusBadge(it.absensi?.statusMasuk)}</TableCell>
                  <TableCell>{statusBadge(it.absensi?.statusKeluar)}</TableCell>
                  <TableCell>
                    {it.absensi?.suratDispensasi ? (
                      <a
                        href={it.absensi.pengumpulanSuratDispensasi ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Lihat
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Menampilkan {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
              {Math.min(page * pageSize, filtered.length)} dari {filtered.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => goto(page - 1)} disabled={page === 1}>
              Prev
            </Button>
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm">Hal {page} / {totalPages}</span>
            </div>
            <Button size="sm" onClick={() => goto(page + 1)} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
