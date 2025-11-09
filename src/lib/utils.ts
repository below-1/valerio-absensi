import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function splitDateString(dateString: string): number[] {
  const [year, month, day] = dateString.split('-').map(Number);
  return [year, month, day];
}

interface Absensi {
    stMasuk: boolean;
    jamMasuk: number | null;
}

function calculateAbsensiScore(absensi: Absensi): number {
    // Rule 1: If stMasuk is TRUE, return 5 immediately
    if (absensi.stMasuk === true) {
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

export function timeStringToMinutes(timeString: string): number {
    if (!timeString || typeof timeString !== 'string') {
        throw new Error('Invalid time string: must be a non-empty string');
    }

    // Remove any whitespace and split by colon
    const cleanTimeString = timeString.trim();
    const parts = cleanTimeString.split(':');
    
    if (parts.length !== 2) {
        throw new Error('Invalid time format: must be in HH:MM format');
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    // Validate hours and minutes ranges
    if (isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid time: hours and minutes must be numbers');
    }

    if (hours < 0 || hours > 23) {
        throw new Error('Invalid hours: must be between 0 and 23');
    }

    if (minutes < 0 || minutes > 59) {
        throw new Error('Invalid minutes: must be between 0 and 59');
    }

    return (hours * 60) + minutes;
}