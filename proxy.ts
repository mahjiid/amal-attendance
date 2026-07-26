import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication (unauthenticated → /auth/login)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/history',
  '/leave-requests',
  '/notifications',
  '/settings',
  '/staff',
]

// Routes only for unauthenticated users (authenticated → redirect away)
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/admin-login']

// Admin-only routes (Staff role → /staff/dashboard)
const ADMIN_ONLY_ROUTES = [
  '/dashboard',
  '/admin',
  '/history',
  '/leave-requests',
  '/notifications',
  '/settings',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Pass through public assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/kiosk') ||
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not remove this call
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

  // 1. Unauthenticated user trying to access a protected route
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirected', 'true')
    return NextResponse.redirect(loginUrl)
  }

  // 2. Authenticated user trying to access auth pages → redirect to appropriate dashboard
  if (isAuthRoute && user) {
    // Fetch role to decide redirect destination
    const { data: emp } = await supabase
      .from('employees')
      .select('role')
      .eq('email', user.email)
      .single()

    const role = emp?.role || 'Staff'
    const adminRoles = ['Admin', 'Superadmin', 'Administration']
    const destination = adminRoles.includes(role) ? '/dashboard' : '/staff/dashboard'

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = destination
    return NextResponse.redirect(redirectUrl)
  }

  // 3. Role-based access: block Staff from Admin-only routes
  if (user) {
    const isAdminOnly = ADMIN_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    )

    if (isAdminOnly) {
      const { data: emp } = await supabase
        .from('employees')
        .select('role')
        .eq('email', user.email)
        .single()

      const role = emp?.role || 'Staff'
      const adminRoles = ['Admin', 'Superadmin', 'Administration']

      if (!adminRoles.includes(role)) {
        const staffUrl = request.nextUrl.clone()
        staffUrl.pathname = '/staff/dashboard'
        return NextResponse.redirect(staffUrl)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
