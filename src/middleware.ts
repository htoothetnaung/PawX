import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Add the paths that should be public
const publicPaths = ['/', '/login', '/signup', '/signup/confirm', '/auth/callback', '/auth/restricted', '/api/shelters']
const adminPaths = ['/adm-dsh']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
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

  const { data: { session } } = await supabase.auth.getSession()
  console.log('Session:', session); // Debug log

  // Check if the path is admin-only
  const isAdminPath = adminPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith('/api/')
  )

  console.log('Is Admin Path:', isAdminPath); // Debug log

  // For admin routes, check user role
  if (isAdminPath && session) {
    const { data: roleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    
    console.log('Role data:', roleData); // Debug log
    console.log('Role error:', error); // Debug log

    if (!roleData || roleData.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/restricted', request.url))
    }
  }

  // If not public and no session, redirect to auth/restricted
  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/auth/restricted', request.url))
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
