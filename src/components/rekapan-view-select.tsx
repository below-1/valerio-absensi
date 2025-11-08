import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RekapanView } from "@/lib/types";

interface RekapanViewSelectProps {
  value: RekapanView;
  onChange: (value: RekapanView) => void;
}

export const RekapanViewSelect: React.FC<RekapanViewSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Kategori Rekapan</span>
      <Select value={value} onValueChange={(val: RekapanView) => onChange(val)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Pilih tampilan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bulanan">Bulanan</SelectItem>
          <SelectItem value="harian">Harian</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
