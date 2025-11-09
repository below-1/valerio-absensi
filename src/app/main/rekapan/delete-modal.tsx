'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteAbsensiAction } from '@/lib/actions/remove-absensi' 
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Props = { 
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function DeleteModal({ id, open, setOpen }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const r = await deleteAbsensiAction(id)
      if (r && !r.success) {
        // handle error, e.g. show toast
        if (r.error && typeof r.error === 'string') {
          toast.error(r.error)
        }
        console.error(r.error)
        return
      } else {
        toast.success("Sukses menghapus data absensi");
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Absensi?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus data absensi secara permanen. 
            Apakah Anda yakin ingin melanjutkan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
