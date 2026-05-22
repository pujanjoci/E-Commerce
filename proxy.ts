import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

  // Refresh session (keeps session alive)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')

  // Protect /admin routes
  if (isAdminRoute) {
    // --------------- DEV TEST-KEY BYPASS ---------------
    // Two paths:
    //   1. Header: x-admin-key: testkey  (curl / Playwright / Requestly)
    //   2. Cookie: x-admin-dev-key=testkey  (set by the login action dev path)
    // Remove ADMIN_TEST_KEY from .env.local to disable both in production.
    const incomingKey  = request.headers.get('x-admin-key')
    const devCookie    = request.cookies.get('x-admin-dev-key')?.value
    const testKey      = process.env.ADMIN_TEST_KEY
    if (testKey && (incomingKey === testKey || devCookie === testKey)) {
      return supabaseResponse  // grant access, skip DB checks
    }
    // ---------------------------------------------------

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check admin role using proper tables (security definer RPC)
    const { data: isAdmin } = await supabase.rpc('is_admin')

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
    }
  }

  // Redirect logged-in admins away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/admin/login')) {
    // Basic check for admin redirection if they hit login
    const { data: isAdmin } = await supabase.rpc('is_admin')
      
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
