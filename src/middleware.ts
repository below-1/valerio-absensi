// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  const payload = await decrypt(session)

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/main')) {
    if (!payload?.userId) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  // Auth routes (login, register) - redirect if already authenticated
  if (request.nextUrl.pathname == '/auth') {
    if (payload?.userId) {
      return NextResponse.redirect(new URL('/main/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}