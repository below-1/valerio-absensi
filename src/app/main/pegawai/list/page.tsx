import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";
import PegawaiTable from "./pegawai-table";

export default async function ListPegawaiPage() {
  const pegawaiData = await db.select().from(pegawai).all()
  return (
    <div>
      <PageHeader
        title="Rekapan Absen"
        description="Lihat dan unduh data absensi karyawan di sini."
        actions={
          <>
            <Button variant="outline">Export</Button>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Tambah Data
            </Button>
          </>
        }
      />

      <PegawaiTable 
        data={pegawaiData} 
      />
    </div>
  )
}