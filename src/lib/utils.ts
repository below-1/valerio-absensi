import { z } from "zod"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ja } from "date-fns/locale";
import { StatusKeluar, StatusMasuk } from "./db/schema";
import { parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function splitDateString(dateString: string): number[] {
  const [year, month, day] = dateString.split('-').map(Number);
  return [year, month, day];
}

interface Absensi {
    presensi: PresensiType;
    jamMasuk: number | null;
}

export function calculateAbsensiMasukScore(absensi: Absensi): number {
    // Rule 1: If stMasuk is TRUE, return 5 immediately
    if (absensi.presensi === "st") {
        return 5;
    }
    
    // Rule 2: If jamMasuk is NULL, return -5
    if (absensi.jamMasuk === null || absensi.jamMasuk === undefined) {
        return -5;
    }
    
    const jamMasuk = absensi.jamMasuk;
    
    // Rule 3: If jamMasuk <= 450, return 5
    if (jamMasuk <= 450) {
        return 5;
    }
    
    // Rule 4: If jamMasuk between 451 AND 480, return 3
    if (jamMasuk >= 451 && jamMasuk <= 480) {
        return 3;
    }
    
    // Rule 5: If jamMasuk between 481 AND 510, return 2
    if (jamMasuk >= 481 && jamMasuk <= 510) {
        return 2;
    }
    
    // Rule 6: If jamMasuk > 510, return 1
    if (jamMasuk > 510) {
        return 1;
    }
    
    // Default case: return 0
    return 0;
}

export const minutesToHHMM = (mins: number | null) => {
  if (mins == null) return "-";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function timeStringToMinutes(timeString: string): number | null {
    if (!timeString || typeof timeString !== 'string') {
      console.log('Invalid time string: must be a non-empty string');
      return null;
    }

    // Remove any whitespace and split by colon
    const cleanTimeString = timeString.trim();
    const parts = cleanTimeString.split(':');
    
    if (parts.length !== 2) {
        console.log('Invalid time format: must be in HH:MM format');
        return null;
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    // Validate hours and minutes ranges
    if (isNaN(hours) || isNaN(minutes)) {
        console.log('Invalid time: hours and minutes must be numbers');
        return null;
    }

    if (hours < 0 || hours > 23) {
        console.log('Invalid hours: must be between 0 and 23');
        return null;
    }

    if (minutes < 0 || minutes > 59) {
        console.log('Invalid minutes: must be between 0 and 59');
        return null;
    }

    return (hours * 60) + minutes;
}

// Zod enum for the status values
export const PresensiStatusEnum = z.enum(['st', 'masuk', 'none']);

// Type inference from the Zod enum
export type PresensiType = z.infer<typeof PresensiStatusEnum>;

// Array of label-value pairs
export const presensiStatusOptions: { label: string; value: PresensiType }[] = [
  {
    label: 'Surat Tugas',
    value: 'st'
  },
  {
    label: 'Ada',
    value: 'masuk'
  },
  {
    label: 'Tidak Ada Keterangan',
    value: 'none'
  }
];

interface AbsensiKeluar {
    presensiKeluar: 'st' | 'masuk' | 'none';
    presensiMasuk: 'st' | 'masuk' | 'none';
    weekday: number; // 1-5 (Monday-Friday)
    jamMasuk?: number | null; // minutes from midnight
    jamKeluar?: number | null; // minutes from midnight
}

export function calculateAbsensiKeluarScore(absensi: AbsensiKeluar): number {
    const { presensiKeluar: presensi, presensiMasuk, weekday, jamMasuk, jamKeluar } = absensi;

    console.log("Calculating Keluar Score with:", absensi);
    
    // Rule 1: If presensi is 'st', return 5 immediately
    if (presensi === 'st') {
        return 1;
    }
    
    // Rule 2: If presensi is 'none', return -2
    console.log('presensi:', presensi);
    if (presensi === 'none') {
        return -2;
    }

    // If either jamMasuk or jamKeluar is missing, return -2
    if (!jamKeluar) {
        return -2;
    }

    if (presensiMasuk == 'st') {
      console.log("Presensi Masuk is ST, applying special rules");
      console.log("Weekday:", weekday, "Jam Keluar:", jamKeluar);
      if (weekday >= 1 && weekday <= 4) {
        if (jamKeluar >= 960) {
            return 1;
        } else {
          return -2;
        }
      } else if (weekday === 5) {
        if (jamKeluar >= 990) {
            return 1;
        } else {
          return -2;
        }
      }
    }

    if (!jamMasuk) {
      return -2;
    }
    
    // Calculate work duration
    const workDuration = jamKeluar - jamMasuk;
    
    // Rules for weekdays 1-4 (Monday-Thursday)
    if (weekday >= 1 && weekday <= 4) {
        // Rule 3: Weekday 1-4 AND jamKeluar >= 960 (16:00) THEN 1
        if (jamKeluar >= 960) {
            return 1;
        }
        
        // Rule 5: Weekday 1-4 AND workDuration >= 510 (8.5 hours) THEN 1
        if (workDuration >= 510) {
            return 1;
        }
        
        // Rule 7: Weekday 1-4 AND workDuration < 510 THEN -2
        if (workDuration < 510) {
            return -2;
        }
    }
    
    // Rules for weekday 5 (Friday)
    if (weekday === 5) {
        // Rule 4: Weekday 5 AND jamKeluar >= 990 (16:30) THEN 1
        if (jamKeluar >= 990) {
            return 1;
        }
        
        // Rule 6: Weekday 5 AND workDuration >= 540 (9 hours) THEN 1
        if (workDuration >= 540) {
            return 1;
        }
        
        // Rule 8: Weekday 5 AND workDuration < 540 THEN -2
        if (workDuration < 540) {
            return -2;
        }
    }
    
    // Default case: return 0
    return 0;
}

/**
 * Get weekday number from Date object (1-7, where 1=Monday, 7=Sunday)
 * This follows the ISO 8601 standard
 */
export function getWeekday(date: Date): number {
    // getDay() returns 0-6 (0=Sunday, 6=Saturday)
    const day = date.getDay();
    // Convert to 1-7 (1=Monday, 7=Sunday)
    return day === 0 ? 7 : day;
}

export function calculateStatusMasuk(presensiMasuk: PresensiType, scoreMasuk: number): StatusMasuk {
  if (presensiMasuk === 'none') return 'alfa';
  if (presensiMasuk === 'st') return 'surat_tugas';
  if (scoreMasuk == 5) return 'tepat_waktu';
  if (scoreMasuk < 5) return 'telat';
  return 'alfa';
}

export function calculateStatusKeluar(presensiKeluar: PresensiType, scoreKeluar: number): StatusKeluar {
  if (presensiKeluar === 'none') return 'terlalu_cepat';
  if (presensiKeluar === 'st') return 'surat_tugas';
  if (scoreKeluar == 1) return 'tepat_waktu';
  if (scoreKeluar < 1) return 'terlalu_cepat';
  return 'terlalu_cepat';
}

export function dayNameToNumber(dayName: string, defaultValue: number = 0): number {
  const dayMap: { [key: string]: number } = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5
  };

  const normalizedDay = dayName.trim().toLowerCase();
  return dayMap[normalizedDay] ?? defaultValue;
}

export function normalizeTimeString(timeStr: string): string {
  // Remove any whitespace and split by colon
  const [hours, minutes] = timeStr.trim().split(':');
  
  // Parse hours and minutes
  const hoursNum = parseInt(hours, 10);
  const minutesNum = parseInt(minutes, 10);
  
  // Validate the time
  if (isNaN(hoursNum) || isNaN(minutesNum) || 
      hoursNum < 0 || hoursNum > 23 || 
      minutesNum < 0 || minutesNum > 59) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  
  // Format to HH:MM (2-digit padding)
  return `${hoursNum.toString().padStart(2, '0')}:${minutesNum.toString().padStart(2, '0')}`;
}

export function parseYYY_MM_DD(s: string) {
  const date = parse(s, 'yyyy-MM-dd', new Date());
  return date;
}

export function parseYYYY_MM(s: string) {
  const date = parse(s, 'yyyy-MM', new Date());
  return {
    year: date.getFullYear(),
    month: date.getMonth()
  };
}