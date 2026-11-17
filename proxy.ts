import { type NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  if (path === '/api' || path.startsWith('/api/') || !['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.json({ error: 'Attendance is temporarily unavailable.' }, { status: 503 })
  }

  if (path === '/service-unavailable') return NextResponse.next()
  return NextResponse.rewrite(new URL('/service-unavailable', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
