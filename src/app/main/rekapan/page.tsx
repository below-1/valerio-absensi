import PageHeader from "@/components/page-header";
import { RekapanViewSelect } from "@/components/rekapan-view-select";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";
import { RekapanActions } from "./rekapan-actions";
import { fetchRekapanAbsenByDay, fetchRekapanAbsenByMonth } from "@/lib/db/fetch";
import RekapanTablePerDay from "./rekapan-table-per-day";
import RekapanTablePerMonth from "./rekapan-table-per-month";
import { format } from "date-fns";

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
  const df = sp.dayFilter;
  const mf = sp.monthFilter;
  const category = sp.category ? sp.category : 'harian';
  const dayFilter = category == 'harian' && !df ? format(new Date(), 'yyyy-MM-dd') : df;
  const monthFilter = category == 'bulanan' && !mf ? format(new Date(), 'yyyy-MM') : df;

  const harianItems = category == 'harian' && dayFilter ? await fetchRekapanAbsenByDay(dayFilter) : [];
  const monthItems = category == 'bulanan' && monthFilter ? await fetchRekapanAbsenByMonth(monthFilter) : [];

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
      {
        category === 'harian' 
          ?  <RekapanTablePerDay results={harianItems} />
          : <RekapanTablePerMonth data={monthItems} />
      }
    </div>
  )
}

