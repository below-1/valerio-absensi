import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skull } from "lucide-react";

type ResultItem = {
  totalScore: number;
  pegawaiId: number;
  nip: string;
  namaPegawai: string;
  totalHari: number;
  totalInScore: number;
  rataRataIn: number;
  totalOutScore: number;
  rataRataOut: number;
};

interface ResultsTableProps {
  data: ResultItem[];
}

const DescendingRekapTable: React.FC<ResultsTableProps> = ({ data }) => {
  // Sort descending by totalScore for ranking
  const sortedData = [...data].sort((a, b) => b.totalScore - a.totalScore);

  // Add ranking info to each record
  const rankedData = sortedData.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  // Take only the last 10 (lowest scorers)
  const lowestTen = rankedData.slice(-10).reverse();

  // Get max score among these 10 for progress scaling
  const maxScore = Math.max(...lowestTen.map((d) => d.totalScore), 1);

  return (
    <Card className="w-full shadow-md rounded-2xl">
      <CardContent className="p-6">
        {/* 🏷️ Title */}
        <h2 className="text-xl font-semibold mb-4 text-red-700">
          Daftar point terendah
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">No.</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead className="text-center">Peringkat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowestTen.map((item, index) => (
              <TableRow key={item.pegawaiId}>
                <TableCell className="text-center font-medium">
                  {index + 1}
                </TableCell>
                <TableCell>{item.nip}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {item.namaPegawai}
                  {/* 💀 Red skull for the lowest scorer */}
                  {index === 0 && (
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-8 w-8 rounded-full bg-red-500 opacity-75 animate-ping" />
                      <Skull className="relative text-red-600 h-6 w-6" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex flex-col gap-1">
                    <Progress
                      value={(item.totalScore / maxScore) * 100}
                      className="h-2"
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.totalScore.toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                {/* ✅ Show original peringkat (global rank) */}
                <TableCell className="text-center">{item.rank}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DescendingRekapTable;
