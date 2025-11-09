// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Fingerprint, User, Lock, Eye, EyeOff, CalendarCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const redirectUrl = searchParams.get('redirect') || '/main/dashboard'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    try {
      const result = await login(formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push(redirectUrl)
        router.refresh()
      }
    } catch (error) {
      setError('Terjadi kesalahan, silakan coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand/Illustration */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-primary lg:to-primary/80">
        <div className="max-w-md text-center text-white px-8">
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm">
              <CalendarCheck className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Aplikasi Absensi</h1>
          <p className="text-lg text-white/90 leading-relaxed">
            Sistem manajemen kehadiran digital yang modern dan efisien untuk mengelola presensi pegawai dengan mudah.
          </p>
          <div className="mt-8 flex justify-center space-x-4 text-sm text-white/80">
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-2 inline-block mb-2">
                <Fingerprint className="h-6 w-6" />
              </div>
              <p>Presensi Digital</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-lg p-2 inline-block mb-2">
                <User className="h-6 w-6" />
              </div>
              <p>Manajemen Pegawai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-4 rounded-2xl">
                <CalendarCheck className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Aplikasi Absensi</h1>
            <p className="text-gray-600 mt-2">Sistem Presensi Digital</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Masuk ke Akun
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Masukkan kredensial Anda untuk mengakses sistem
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" action={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      placeholder="Masukkan username Anda"
                      className="pl-10 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan password Anda"
                      className="pl-10 pr-10 h-11 border-gray-300 focus:border-primary focus:ring-primary"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>
              </form>

              {/* Additional Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Hubungi administrator jika Anda lupa kredensial login
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Aplikasi Absensi. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}