'use client';

import { useRouter } from "next/navigation"
import { RekapanViewSelect } from "@/components/rekapan-view-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, SearchIcon } from "lucide-react";
import { useState } from "react";
import { format, parse } from "date-fns";
import { id } from "date-fns/locale";

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
  category: 'harian' | 'bulanan';
  dayFilter?: string;
  monthFilter?: string;
}

function parseYYY_MM_DD(s: string) {
  const date = parse(s, 'yyyy-MM-dd', new Date());
  return date;
}

export function RekapanActions({ category, dayFilter, monthFilter }: RekapanActionsProps) {
  const router = useRouter()
  const [rekapanView, setRekapanView] = useState<"bulanan" | "harian">(category);
  const [date, setDate] = useState<Date>(dayFilter ? parseYYY_MM_DD(dayFilter) : new Date());
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

  return (
    <>
      <RekapanViewSelect
        value={rekapanView}
        onChange={r => {
          if (r == 'harian') {
            const d = format(date, 'yyyy-MM-dd');
            router.replace(`/main/rekapan?category=harian&dayFilter=${d}`)
          } else if (r == 'bulanan') {
          }
          setRekapanView(r)
        }}
      />
      
      {rekapanView === "harian" ? (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Pilih Hari</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: id }) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  date && setDate(date)
                  if (date) {
                    const d = format(date, 'yyyy-MM-dd');
                    router.push(`/main/rekapan?category=harian&dayFilter=${d}`)
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Pilih Bulan</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
      )}

      <Button color="primary">
        <SearchIcon className="h-4 w-4" />
        Cari
      </Button>
    </>
  )
}