import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, LogOut, XCircle, LucideIcon } from "lucide-react";

// current month name
type MonthOptions = {
  monthName: string;
  monthNumber: string;
};
const getMonthInfo = (): MonthOptions => {
  const now = new Date();
  return {
    monthName: now.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
    monthNumber: (now.getMonth() + 1).toString().padStart(2, '0'),
  };
};

const { monthName } = getMonthInfo();

const stats = [
  {
    title: "Presentasi Tepat Waktu",
    value: Math.floor(Math.random() * 40 + 60), // 60–100%
    total: Math.floor(Math.random() * 200 + 300), // total count
    icon: CheckCircle,
    color: "from-green-100 to-green-50 border-green-200",
    iconColor: "text-green-600",
  },
  {
    title: "Presentasi Terlambat",
    value: Math.floor(Math.random() * 30 + 10), // 10–40%
    total: Math.floor(Math.random() * 100 + 100),
    icon: Clock,
    color: "from-yellow-100 to-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
  },
  {
    title: "Presentasi Pulang Awal",
    value: Math.floor(Math.random() * 20 + 5), // 5–25%
    total: Math.floor(Math.random() * 50 + 80),
    icon: LogOut,
    color: "from-orange-100 to-orange-50 border-orange-200",
    iconColor: "text-orange-600",
  },
  {
    title: "Presentasi Tidak Absen",
    value: Math.floor(Math.random() * 10 + 1), // 1–10%
    total: Math.floor(Math.random() * 20 + 40),
    icon: XCircle,
    color: "from-red-100 to-red-50 border-red-200",
    iconColor: "text-red-600",
  },
];

type Props = {
  stats: {
    title: string;
    value: number;
    total: number;
    icon: LucideIcon;
    color: string;
    iconColor: string;
  }[]
}

export default function AttendanceStatsGrid({
  stats
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {stats.map((item, i) => {
        const Icon = item.icon;
        return (
          <Card
            key={i}
            className={`rounded-xl border shadow-md bg-gradient-to-br ${item.color} hover:shadow-lg transition-shadow duration-300 h-36`}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 text-center space-y-1 h-full">
              <div className={`p-2 rounded-full bg-white/80 ${item.iconColor}`}>
                <Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
              <div className="text-2xl font-bold">{item.value}%</div>
              <div className="text-xs text-gray-600">
                Total: <span className="font-semibold">{item.total}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">Bulan: {monthName}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Example usage:
// import AttendanceStatsGrid from './AttendanceStatsGrid';
// <AttendanceStatsGrid />