'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal } from "lucide-react";
import { motion } from "framer-motion";

export type Employee = {
  pegawaiId: number;
  nip: string;
  namaPegawai: string;
  totalScore: number;
  totalInScore?: number;
  totalOutScore?: number;
  totalHari?: number;
  avatarUrl?: string | null;
};

type PodiumProps = {
  data: Employee[]; // expects array of employees, will pick top 3 by totalScore
  title?: string;
};

// helper to format number with sign
const formatScore = (v?: number) => (v == null ? "—" : `${v}`);

export default function Podium({ data, title = "Top Performers" }: PodiumProps) {
  // defensive: ensure array
  const sorted = (data || []).slice().sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
  const [second, first, third] = [sorted[1], sorted[0], sorted[2]];

  // layout heights for podium blocks (higher = better)
  const heights = {
    second: "h-40",
    first: "h-56",
    third: "h-32",
  };

  return (
    <Card className="p-4 shadow-lg rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">Top 3 employees this month</p>
          </div>
          <Badge className="uppercase">Podium</Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-end">
          {/* second place */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-full ${heights.second} rounded-2xl shadow-md p-3 flex flex-col items-center justify-end bg-gradient-to-b from-white/60 to-slate-50`}
            >
              <div className="mb-2 text-sm text-gray-600">2</div>
              <Avatar className="w-12 h-12">
                {second?.avatarUrl ? (
                  <AvatarImage src={second.avatarUrl} />
                ) : (
                  <AvatarFallback>{second?.namaPegawai?.[0] ?? "?"}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="font-medium text-sm truncate max-w-[140px]">{second?.namaPegawai ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">{second?.nip ?? ''}</div>
                </div>
              </div>
              <div className="mt-3 text-lg font-semibold">{formatScore(second?.totalScore)}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Second Place</div>
          </motion.div>

          {/* first place */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-full ${heights.first} rounded-2xl shadow-xl p-4 flex flex-col items-center justify-end bg-gradient-to-b from-yellow-50 to-white border-2 border-yellow-200`}
            >
              <div className="mb-2 text-sm text-amber-700 flex items-center gap-2">
                <Medal className="w-4 h-4 text-amber-600" /> 1
              </div>

              <Avatar className="w-14 h-14 ring-4 ring-amber-100">
                {first?.avatarUrl ? (
                  <AvatarImage src={first.avatarUrl} />
                ) : (
                  <AvatarFallback>{first?.namaPegawai?.[0] ?? "?"}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="font-semibold text-base truncate max-w-[160px]">{first?.namaPegawai ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">{first?.nip ?? ''}</div>
                </div>
              </div>

              <div className="mt-3 text-2xl font-bold">{formatScore(first?.totalScore)}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Champion</div>
          </motion.div>

          {/* third place */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.07 }}
            className="flex flex-col items-center"
          >
            <div
              className={`w-full ${heights.third} rounded-2xl shadow-md p-3 flex flex-col items-center justify-end bg-gradient-to-b from-white/60 to-slate-50`}
            >
              <div className="mb-2 text-sm text-gray-600">3</div>
              <Avatar className="w-10 h-10">
                {third?.avatarUrl ? (
                  <AvatarImage src={third.avatarUrl} />
                ) : (
                  <AvatarFallback>{third?.namaPegawai?.[0] ?? "?"}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="font-medium text-sm truncate max-w-[120px]">{third?.namaPegawai ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">{third?.nip ?? ''}</div>
                </div>
              </div>
              <div className="mt-3 text-lg font-semibold">{formatScore(third?.totalScore)}</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Third Place</div>
          </motion.div>
        </div>

        {/* details row */}
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {/* small summary cards for each of top 3 */}
          {[second, first, third].map((emp, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 shadow-sm">
              <div className="text-xs text-muted-foreground">{i === 0 ? '2nd' : i === 1 ? '1st' : '3rd'}</div>
              <div className="font-medium truncate">{emp?.namaPegawai ?? '—'}</div>
              <div className="text-sm text-muted-foreground">NIP: {emp?.nip ?? '—'}</div>
              <div className="mt-2 text-sm">Score: <span className="font-semibold">{formatScore(emp?.totalScore)}</span></div>
              <div className="text-xs text-muted-foreground">In: {formatScore(emp?.totalInScore)} · Out: {formatScore(emp?.totalOutScore)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------
// Example usage with sample data:
// -----------------------------
//
// import Podium, { Employee } from './Podium';
//
// const sample: Employee[] = [
//   { pegawaiId: 1, nip: '19800101', namaPegawai: 'Alya', totalScore: 120, totalInScore: 80, totalOutScore: 40 },
//   { pegawaiId: 2, nip: '19800102', namaPegawai: 'Budi', totalScore: 110, totalInScore: 70, totalOutScore: 40 },
//   { pegawaiId: 3, nip: '19800103', namaPegawai: 'Citra', totalScore: 90, totalInScore: 50, totalOutScore: 40 },
//   // ...more
// ];
//
// <Podium data={sample} title="Podium Bulan November" />
