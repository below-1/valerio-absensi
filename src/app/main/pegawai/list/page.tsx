import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { pegawai } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";
import PegawaiTable from "./pegawai-table";
import { AddPegawaiModal } from "./add-pegawai-modal";

export default async function ListPegawaiPage() {
  const pegawaiData = await db.select().from(pegawai).all()
  return (
    <div>
      <PageHeader
        title="Data Pegawai"
        description="Lihat data pegawai di sini."
        actions={
          <>
            <AddPegawaiModal />
          </>
        }
      />

      <PegawaiTable 
        data={pegawaiData as any[]} 
      />
    </div>
  )
}