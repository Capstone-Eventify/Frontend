import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect auth-related routes to homepage with appropriate query parameters
  if (pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('signin', 'true')
    return NextResponse.redirect(url)
  }

  if (pathname === '/signin') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('signin', 'true')
    return NextResponse.redirect(url)
  }

  if (pathname === '/signup') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('signup', 'true')
    return NextResponse.redirect(url)
  }

  if (pathname === '/forgot-password') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('signin', 'true')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/signin', 
    '/signup',
    '/forgot-password'
  ]
}