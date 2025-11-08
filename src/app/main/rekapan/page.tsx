import PageHeader from "@/components/page-header";
import { RekapanViewSelect } from "@/components/rekapan-view-select";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";
import { RekapanActions } from "./rekapan-actions";
import { fetchRekapanAbsenByDay } from "@/lib/db/fetch";
import RekapanTablePerDay from "./rekapan-table-per-day";

type SearchParams = { 
  category?: string;
  dayFilter?: string;
  monthFilter?: string;
};

export default async function ListPegawaiPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams;
  const { dayFilter, monthFilter } = sp;
  const category = sp.category ? sp.category : 'harian';

  const absensiList = dayFilter 
    ? await fetchRekapanAbsenByDay(dayFilter)
    : await fetchRekapanAbsenByDay('2025=11-06');

  return (
    <div>
      <PageHeader
        title="Rekapan Absen"
        description="Lihat dan unduh rekapan absen di sini."
        actions={
          <RekapanActions
            category={category as any}
          />
        }
      />
      <RekapanTablePerDay
        results={absensiList}
      />
    </div>
  )
}

