'use client';

import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, parseYYYY_MM } from "@/lib/utils";
import { CalendarIcon, PlusCircle, SearchIcon } from "lucide-react";
import { useState } from "react";
import { format, parse } from "date-fns";
import { id } from "date-fns/locale";
import { Input } from "@/components/ui/input";

const months = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

type RekapanActionsProps = {
  monthFilter?: string;
}


export function HeaderFilter({ monthFilter }: RekapanActionsProps) {
  const router = useRouter()

  const [year, setYear] = useState( monthFilter ? parseYYYY_MM(monthFilter).year : (new Date()).getFullYear() )
  const [selectedMonth, setSelectedMonth] = useState(
    String(monthFilter ? parseYYYY_MM(monthFilter).month + 1 : (new Date()).getMonth() + 1)
  );

  return (
    <div className="grid md:grid-cols-2 gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Tahun</span>
        <Input
          type="number"
          value={year}
          onChange={r => {
            const y = parseInt((r.target as any).value)
            setYear(parseInt((r.target as any).value))
            
            const monthFilter = `${y}-${selectedMonth.padStart(2, "0")}`;
            router.push(`/?monthFilter=${monthFilter}`)
          }}
          min={2023}
          max={2050}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Pilih Bulan</span>
        <Select 
          value={selectedMonth} 
          onValueChange={s => {
            setSelectedMonth(s)
            const ss = s.padStart(2, "0")
            const monthFilter = `${year}-${ss}`;
            router.push(`/?monthFilter=${monthFilter}`)
            setSelectedMonth(s)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Pilih bulan" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}