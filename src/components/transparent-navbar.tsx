import { FC } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, CalendarCheck, User, Users } from "lucide-react"

const Navbar: FC = () => {
  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Side - Logo and Title */}
        <div className="flex items-center space-x-3 grow">
          <div className="bg-primary text-white rounded-lg p-2">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            AbsensiApp
          </h1>
        </div>

        {/* Center - Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/main/pegawai/list" className="flex items-center text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            <Users className="h-4 w-4 mr-1" />
            Pegawai
          </Link>
          <Link href="/main/rekapan" className="flex items-center text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            <CalendarCheck className="h-4 w-4 mr-1" />
            Rekapan Absen
          </Link>
          {/* Right Side - User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/user-avatar.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">Username</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
