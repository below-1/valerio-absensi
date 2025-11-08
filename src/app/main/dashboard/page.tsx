'use server';

import AttendanceStatsGrid from "@/components/attendance-stats-grid";
import Podium from "@/components/podium-component";
import { fetchRekapanAbsenByMonth } from "@/lib/db/fetch";
import RekapanTablePerMonth from "../rekapan/rekapan-table-per-month";
import DescendingRekapTable from "../rekapan/descending-rekap-table";

export default async function DashboardPage() {
  const results = await fetchRekapanAbsenByMonth("2025-11")
  return (
    <div>
      <AttendanceStatsGrid />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Podium data={results} />
        <RekapanTablePerMonth data={results.slice(0, 10)} />
      </div>

      <DescendingRekapTable
        data={results}
      />
    </div>
  )
}