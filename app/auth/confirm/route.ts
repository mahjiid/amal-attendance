import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  
  // Determine redirect based on type
  let next = searchParams.get('next')
  if (!next) {
    // If it's a password recovery, go to reset page
    // If it's signup/email confirmation, show confirmation page first
    // Otherwise go to login
    next = type === 'recovery' ? '/auth/reset-password' : '/auth/confirmed'
  }

  // Standard PKCE code exchange or Token Hash exchange
  // Supabase links usually look like: /?token_hash=...&type=signup&next=...
  
  if (token_hash && type) {
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
  return NextResponse.redirect(new URL('/auth/confirmed?error=verification_failed', request.url))
}
