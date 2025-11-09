// components/pegawai/edit-pegawai-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil } from 'lucide-react';
import { pegawaiUpdateSchema, type PegawaiUpdateValues, type Pegawai, statusOptions } from '@/lib/schema-validation';
import { updatePegawai } from '@/lib/actions/update-pegawai';

interface EditPegawaiModalProps {
  pegawai: Pegawai;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

interface ServerError {
  path: string;
  message: string;
}

export function EditPegawaiModal({ pegawai, trigger, onSuccess, open, setOpen }: EditPegawaiModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [serverErrors, setServerErrors] = useState<ServerError[]>([]);

  const form = useForm<PegawaiUpdateValues>({
    resolver: zodResolver(pegawaiUpdateSchema),
    defaultValues: {
      id: pegawai.id,
      nip: pegawai.nip,
      nama: pegawai.nama,
      status: pegawai.status || undefined,
    },
  });

  // Reset form when pegawai prop changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        id: pegawai.id,
        nip: pegawai.nip,
        nama: pegawai.nama,
        status: pegawai.status || undefined,
      });
      setServerErrors([]);
    }
  }, [open, pegawai, form]);

  const onSubmit = async (data: PegawaiUpdateValues) => {
    setLoading(true);
    setServerErrors([]);

    try {
      const result = await updatePegawai(data);

      if (result.success) {
        form.reset();
        setOpen(false);
        onSuccess?.();
        // You can add a toast notification here
        console.log('Employee updated successfully:', result.data);
      } else {
        // Handle server-side validation errors
        if (result.errors) {
          const rootErrors: ServerError[] = [];
          
          result.errors.forEach(error => {
            if (error.path === 'root') {
              rootErrors.push(error);
            } else {
              form.setError(error.path as keyof PegawaiUpdateValues, {
                type: 'server',
                message: error.message
              });
            }
          });

          if (rootErrors.length > 0) {
            setServerErrors(rootErrors);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setServerErrors([{ path: 'root', message: 'An unexpected error occurred' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = async (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset form when modal closes
      form.reset({
        id: pegawai.id,
        nip: pegawai.nip,
        nama: pegawai.nama,
        status: pegawai.status || undefined,
      });
      setServerErrors([]);
      form.clearErrors();
    }
  };

  const rootErrors = serverErrors.filter(error => error.path === 'root');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update the employee details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {rootErrors.length > 0 && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                <ul className="list-disc list-inside">
                  {rootErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hidden ID field */}
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nip"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>NIP</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter NIP (numbers only)" 
                      {...field} 
                      disabled={loading}
                      className={fieldState.error ? 'border-destructive' : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nama"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter full name" 
                      {...field} 
                      disabled={loading}
                      className={fieldState.error ? 'border-destructive' : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Employment Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select employment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Employee
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}