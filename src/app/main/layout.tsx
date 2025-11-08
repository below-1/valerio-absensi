'use server';

import { FC, ReactNode } from "react"
import Navbar from "@/components/transparent-navbar"
import { fetchPegawaiOptions } from "@/lib/db/fetch";

const Footer: FC = () => (
  <footer className="w-full bg-white border-t shadow-sm py-3 text-center text-sm text-gray-500">
    © {new Date().getFullYear()} AbsensiApp. All rights reserved.
  </footer>
)

interface LayoutProps {
  children: ReactNode
}

export default async function MainLayout({ children }: { children: ReactNode }) {
  const pegawaiOptions = await fetchPegawaiOptions()
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar pegawaiOptions={pegawaiOptions} />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-[64px] pb-[48px] bg-gray-50">
        {/* Adjust padding-top & padding-bottom to match Navbar/Footer height */}
        <div className="container mx-auto px-4 py-6 h-full">
          {children}
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <Footer />
      </div>
    </div>
  )
}
