import PageHeader from "@/components/page-header";
import { RekapanViewSelect } from "@/components/rekapan-view-select";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";
import { fetchPegawai, fetchPegawaiOptions, fetchRekapanAbsenByDay, fetchRekapanAbsenByMonth, fetchRekapanAbsenByMonthAndPegawai } from "@/lib/db/fetch";
import { format } from "date-fns";
import PegawaiAbsenPerMonth from "./PegawaiAbsenPerMonth";
import { HeaderFilter } from "./header-filter";

type SearchParams = {
  monthFilter?: string;
};

export default async function ListPegawaiPage({
  searchParams,
  params
}: {
  searchParams: Promise<SearchParams>,
  params: Promise<{
    id: string;
  }>
}) {
  const sp = await searchParams;
  const ps = await params;
  const mf = sp.monthFilter;
  const monthFilter = !mf ? format(new Date(), 'yyyy-MM') : mf;
  const pid = parseInt(ps.id)

  const monthItems = await fetchRekapanAbsenByMonthAndPegawai(monthFilter, pid);
  console.log(monthItems);

  const pegawai = await fetchPegawai(pid)

  return (
    <div>
      <PageHeader
        title={"Rekapan Absen - " + pegawai.nama}
        description="Lihat dan unduh rekapan absen di sini."
        actions={
          <HeaderFilter
            pid={pid}
            monthFilter={monthFilter}
          />
        }
      />
      <PegawaiAbsenPerMonth results={monthItems as any[]} />
    </div>
  )
}

