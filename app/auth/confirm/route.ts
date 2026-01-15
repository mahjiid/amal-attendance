import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/auth/login'

  // Standard PKCE code exchange or Token Hash exchange
  // Supabase links usually look like: /?token_hash=...&type=signup&next=...
  
  if (token_hash && type) {
    const cookieStore = {
        getAll: () => [],
        set: () => {}
    } // Pseudo store, we need real cookies from request
    
    // We need to use standard createServerClient with cookie handling
    // Copying standard pattern or importing from utils if available.
    // Let's rely on manual construction to be safe in this scope or strict import.
    // Actually, I should use the utils/supabase/server if it supports context.
    // But route handlers need independent cookie handling usually.
    
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // General Error / Fallback
  return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url))
}
