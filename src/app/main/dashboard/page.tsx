'use server';

import AttendanceStatsGrid from "@/components/attendance-stats-grid";
import Podium from "@/components/podium-component";
import { calculateAttendanceStatsDrizzle, fetchRekapanAbsenByMonth } from "@/lib/db/fetch";
import RekapanTablePerMonth from "../rekapan/rekapan-table-per-month";
import DescendingRekapTable from "../rekapan/descending-rekap-table";
import { format } from "date-fns";
import { HeaderFilter } from "./header-filter";
import { CheckCircle, Clock, LogOut, XCircle } from "lucide-react";
import RekapanTopTable from "./rekapan-top-table";
import { getSession } from "@/lib/actions/auth";

type Props = {
  searchParams: Promise<{
    monthFilter?: string;
  }>
}

export default async function DashboardPage({
  searchParams
}: Props) {
  const sp = await searchParams;
  const monthFilter = !sp.monthFilter ? format(new Date(), 'yyyy-MM') : sp.monthFilter;
  const aggregates = await calculateAttendanceStatsDrizzle(monthFilter)
  const results = await fetchRekapanAbsenByMonth(monthFilter)

  const stats = [
    {
      title: "Presentasi Tepat Waktu",
      value: aggregates.percentages.tepatWaktuMasuk,
      total: aggregates.totalRecords,
      icon: CheckCircle,
      color: "from-green-100 to-green-50 border-green-200",
      iconColor: "text-green-600",
    },
    {
      title: "Presentasi Terlambat",
      value: aggregates.percentages.telat,
      total: aggregates.totalRecords,
      icon: Clock,
      color: "from-yellow-100 to-yellow-50 border-yellow-200",
      iconColor: "text-yellow-600",
    },
    {
      title: "Presentasi Pulang Awal",
      value: aggregates.percentages.terlaluCepat,
      total: aggregates.totalRecords,
      icon: LogOut,
      color: "from-orange-100 to-orange-50 border-orange-200",
      iconColor: "text-orange-600",
    },
    {
      title: "Presentasi Tidak Absen",
      value: aggregates.percentages.alfa,
      total: aggregates.totalRecords,
      icon: XCircle,
      color: "from-red-100 to-red-50 border-red-200",
      iconColor: "text-red-600",
    },
  ];
  return (
    <div>
      <div className="w-full md:w-1/2 mt-20 md:mt-0">
        <HeaderFilter monthFilter={monthFilter} />
      </div>
      <AttendanceStatsGrid stats={stats} />
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Podium data={results} />
        <RekapanTopTable data={results.slice(0, 10)} />
      </div>

      <DescendingRekapTable
        data={results}
      />
    </div>
  )
}