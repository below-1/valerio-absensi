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
import { Star } from "lucide-react";

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

const RekapanTopTable: React.FC<ResultsTableProps> = ({ data }) => {
  console.log(data)
  // Sort data by totalScore descending for ranking
  const sortedData = [...data].sort((a, b) => b.totalScore - a.totalScore);
  const maxScore = Math.max(...sortedData.map((d) => d.totalScore), 1);

  return (
    <Card className="w-full shadow-md rounded-2xl">
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead className="text-center">Peringkat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={item.pegawaiId}>
                <TableCell className="flex items-center gap-2">
                  {item.namaPegawai}
                  {index === 0 && (
                    <Star className="text-yellow-500 fill-yellow-500 h-4 w-4" />
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
                <TableCell className="text-center">{index + 1}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RekapanTopTable;
