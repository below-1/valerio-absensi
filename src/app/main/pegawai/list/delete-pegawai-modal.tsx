// components/pegawai/delete-pegawai-modal.tsx
'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { type Pegawai } from '@/lib/schema-validation';
import { deletePegawai } from '@/lib/actions/remove-pegawai';

interface DeletePegawaiModalProps {
  pegawai: Pegawai;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export function DeletePegawaiModal({ open, setOpen, pegawai, trigger, onSuccess }: DeletePegawaiModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deletePegawai(pegawai.id);

      if (result.success) {
        setOpen(false);
        onSuccess?.();
        // You can add a toast notification here
        console.log('Employee deleted successfully');
      } else {
        setError(result.error || 'Failed to delete employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Employee
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the employee record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold">Employee Details:</p>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="font-medium">NIP:</span> {pegawai.nip}</p>
              <p><span className="font-medium">Name:</span> {pegawai.nama}</p>
              <p><span className="font-medium">Status:</span> {pegawai.status}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this employee? This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}