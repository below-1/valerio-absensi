'use client';

import { RekapanViewSelect } from "@/components/rekapan-view-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusCircle, SearchIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
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

export function RekapanActions() {
  const [rekapanView, setRekapanView] = useState<"bulanan" | "harian">("bulanan");
  const [date, setDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));

  return (
    <>
      <RekapanViewSelect
        value={rekapanView}
        onChange={setRekapanView}
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
                onSelect={(date) => date && setDate(date)}
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