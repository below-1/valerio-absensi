import PageHeader from "@/components/page-header";
import { RekapanViewSelect } from "@/components/rekapan-view-select";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";
import { RekapanActions } from "./rekapan-actions";

export default async function ListPegawaiPage() {
  return (
    <div>
      <PageHeader
        title="Rekapan Absen"
        description="Lihat dan unduh rekapan absen di sini."
        actions={
          <RekapanActions />
        }
      />
    </div>
  )
}