'use client';

import { RekapanViewSelect } from "@/components/rekapan-view-select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export function RekapanActions() {
  const [ rekapanView, setRekapanView ] = useState<"bulanan" | "harian">("bulanan");
  return (
    <>
      <Button variant="outline">Export</Button>
      <Button className="flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Tambah Data
      </Button>
      <RekapanViewSelect
        value={rekapanView}
        onChange={setRekapanView}
      />
    </>
  )
}