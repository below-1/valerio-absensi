import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function splitDateString(dateString: string): number[] {
  const [year, month, day] = dateString.split('-').map(Number);
  return [year, month, day];
}