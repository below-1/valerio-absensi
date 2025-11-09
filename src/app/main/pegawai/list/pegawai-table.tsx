"use client"

import { FC } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Pegawai {
  id: number
  nip: string
  nama: string
}

interface PegawaiTableProps {
  data: Pegawai[]
  isLoading?: boolean
  onEdit?: (pegawai: Pegawai) => void
  onDelete?: (pegawai: Pegawai) => void
}

const PegawaiTable: FC<PegawaiTableProps> = ({
  data,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const router = useRouter()
  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-sm text-muted-foreground">
        Loading data...
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center py-8 text-sm text-muted-foreground">
        Tidak ada data pegawai.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">ID</TableHead>
            <TableHead>NIP</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead className="w-[50px] text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((pegawai) => (
            <TableRow key={pegawai.id}>
              <TableCell className="text-center">{pegawai.id}</TableCell>
              <TableCell>{pegawai.nip}</TableCell>
              <TableCell>{pegawai.nama}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        router.push(`/main/pegawai/detail/${pegawai.id}`)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(pegawai)}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default PegawaiTable
