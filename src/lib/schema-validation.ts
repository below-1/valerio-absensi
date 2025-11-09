// lib/validations/pegawai.ts
import { z } from 'zod';

export const statusEnum = {
  PNS: 'PNS',
  PPPK: 'PPPK',
  Outsourcing: 'Outsourcing',
  'Konsultan Individu': 'Konsultan Individu',
} as const;

export const statusOptions = [
  { value: 'PNS', label: 'PNS' },
  { value: 'PPPK', label: 'PPPK' },
  { value: 'Outsourcing', label: 'Outsourcing' },
  { value: 'Konsultan Individu', label: 'Konsultan Individu' },
] as const;

// Base schema for both create and update
const basePegawaiSchema = {
  nip: z.string()
    .min(1, { message: 'NIP is required' })
    .regex(/^\d+$/, { message: 'NIP must contain only numbers' })
    .min(3, { message: 'NIP must be at least 3 characters' }),
  nama: z.string()
    .min(1, { message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  status: z.enum([statusEnum.PNS, statusEnum.PPPK, statusEnum.Outsourcing, statusEnum['Konsultan Individu']]),
};

// Schema for creating new pegawai
export const pegawaiFormSchema = z.object(basePegawaiSchema);

// Schema for updating pegawai (includes ID)
export const pegawaiUpdateSchema = z.object({
  id: z.number().min(1, { message: 'ID is required' }),
  ...basePegawaiSchema,
});

export type PegawaiFormValues = z.infer<typeof pegawaiFormSchema>;
export type PegawaiUpdateValues = z.infer<typeof pegawaiUpdateSchema>;
export type StatusType = keyof typeof statusEnum;

// Type for pegawai data from database
export type Pegawai = {
  id: number;
  nip: string;
  nama: string;
  status: StatusType | null;
};