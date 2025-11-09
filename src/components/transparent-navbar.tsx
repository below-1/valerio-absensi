'use client';

import { FC, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  CalendarCheck, 
  User, 
  Users, 
  LayoutDashboardIcon,
  Menu,
  X
} from "lucide-react"
import { AddAbsensiModal } from "./add-rekap-modal"
import { logout } from "@/lib/actions/auth";

type Props = {
  pegawaiOptions: {
    id: number;
    nama: string;
  }[];
  session: any;
}

const Navbar = ({ pegawaiOptions, session }: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      href: "/main/dashboard",
      icon: LayoutDashboardIcon,
      label: "Dashboard"
    },
    {
      href: "/main/pegawai/list",
      icon: Users,
      label: "Pegawai"
    },
    {
      href: "/main/rekapan",
      icon: CalendarCheck,
      label: "Rekapan Absen"
    }
  ]

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-white rounded-lg p-2">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              AbsensiApp
            </h1>
            <h1 className="text-lg font-semibold tracking-tight sm:hidden">
              AA
            </h1>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                <item.icon className="h-4 w-4 mr-1" />
                {item.label}
              </Link>
            ))}
            <AddAbsensiModal 
              pegawaiOptions={pegawaiOptions} 
            />
          </div>

          {/* Right Side - User Dropdown (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{session.username}</span>
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
                <form action={logout}>
                  <DropdownMenuItem className="text-red-600" asChild>
                    <button type="submit" className="w-full">
                      Logout
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <AddAbsensiModal 
              pegawaiOptions={pegawaiOptions}
              variant="icon"
            />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center space-x-3 pb-6 border-b">
                    <div className="bg-primary text-white rounded-lg p-2">
                      <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <h1 className="text-lg font-semibold">AbsensiApp</h1>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 py-6">
                    <nav className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>

                  {/* Mobile User Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center space-x-3 px-3 py-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/user-avatar.png" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.username}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          user@example.com
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-1">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm text-red-600 hover:text-red-700"
                        onClick={closeMobileMenu}
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Add Absensi Modal for medium screens (tablet) */}
        <div className="md:hidden lg:hidden mt-3">
          <AddAbsensiModal 
            pegawaiOptions={pegawaiOptions}
            variant="full"
          />
        </div>
      </div>
    </nav>
  )
}

export default Navbar