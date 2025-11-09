"use client"

import { FC, useState, useMemo } from "react"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, MagnetIcon, EditIcon, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { EditPegawaiModal } from "./edit-pegawai-modal"
import { DeletePegawaiModal } from "./delete-pegawai-modal"

interface Pegawai {
  id: number
  nip: string
  nama: string
  status: string
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
  const [pegawai, setPegawai] = useState<Pegawai | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter data based on search term (name or NIP)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data
    }

    const lowercasedSearch = searchTerm.toLowerCase()
    return data.filter((pegawai) =>
      pegawai.nama.toLowerCase().includes(lowercasedSearch) ||
      pegawai.nip.toLowerCase().includes(lowercasedSearch)
    )
  }, [data, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

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
    <>
      {pegawai && (
        <EditPegawaiModal
          open={editOpen}
          setOpen={setEditOpen}
          pegawai={pegawai as any}
        />
      )}
      {pegawai && (
        <DeletePegawaiModal
          open={deleteOpen}
          setOpen={setDeleteOpen}
          pegawai={pegawai as any}
        />
      )}
      
      {/* Search Input */}
      <div className="mb-4 relative">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan nama atau NIP..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              ×
            </Button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-muted-foreground mt-2">
            Menampilkan {filteredData.length} dari {data.length} pegawai
            {searchTerm && ` untuk pencarian "${searchTerm}"`}
          </p>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">ID</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? (
                    <div className="flex flex-col items-center gap-2">
                      <span>Tidak ada pegawai yang cocok dengan pencarian "{searchTerm}"</span>
                      <Button variant="outline" size="sm" onClick={clearSearch}>
                        Tampilkan semua pegawai
                      </Button>
                    </div>
                  ) : (
                    "Tidak ada data pegawai."
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((pegawai) => (
                <TableRow key={pegawai.id}>
                  <TableCell className="text-center">{pegawai.id}</TableCell>
                  <TableCell className="font-mono text-sm">{pegawai.nip}</TableCell>
                  <TableCell>{pegawai.nama}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pegawai.status === 'PNS' ? 'bg-blue-100 text-blue-800' :
                      pegawai.status === 'PPPK' ? 'bg-green-100 text-green-800' :
                      pegawai.status === 'Outsourcing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {pegawai.status}
                    </span>
                  </TableCell>
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
                            setPegawai(pegawai)
                            setEditOpen(true)
                          }}
                          className="flex items-center gap-2"
                        >
                          <EditIcon className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/main/pegawai/detail/${pegawai.id}`)
                          }}
                          className="flex items-center gap-2"
                        >
                          <MagnetIcon className="h-4 w-4" />
                          Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPegawai(pegawai)
                            setDeleteOpen(true)
                          }}
                          className="flex items-center gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default PegawaiTable