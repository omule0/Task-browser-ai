import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Get current URL path
    const path = request.nextUrl.pathname

    // Define routes
    const isPublicRoute = path.startsWith('/login') ||
                         path.startsWith('/signup') ||
                         path.startsWith('/auth') ||
                         path.startsWith('/confirm-email') ||
                         path.startsWith('/maintenance')
    
    const isMaintenancePage = path.startsWith('/maintenance')
    const isAdminRoute = path.startsWith('/admin')

    // Get session and maintenance status
    const { data: { session } } = await supabase.auth.getSession()
    const { data: maintenance } = await supabase
      .from('system_status')
      .select('maintenance_mode')
      .single()

    // Function to check if user is admin
    async function isAdmin(userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()
      return profile?.is_admin === true
    }

    // 1. Handle maintenance mode
    if (maintenance?.maintenance_mode === true) {
      // Allow access to maintenance page
      if (isMaintenancePage) {
        return response
      }

      // If user is logged in, check if they're admin
      if (session) {
        const admin = await isAdmin(session.user.id)
        if (admin) {
          return response // Allow admin to access any page during maintenance
        }
      }

      // Redirect non-admins to maintenance page
      if (!isMaintenancePage) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    }

    // 2. Handle authentication
    if (!session) {
      // Allow access to public routes
      if (isPublicRoute) {
        return response
      }
      // Redirect to login for protected routes
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Handle authenticated users
    if (session) {
      // Redirect away from public routes if logged in
      if (path.startsWith('/login') || path.startsWith('/signup')) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Handle admin routes
      if (isAdminRoute) {
        const admin = await isAdmin(session.user.id)
        if (!admin) {
          return NextResponse.redirect(new URL('/', request.url))
        }
      }

      // Check workspace requirement (skip for admin routes)
      if (!isAdminRoute) {
        const { data: workspaces } = await supabase
          .from('workspaces')
          .select('id')
          .limit(1)

        if ((!workspaces || workspaces.length === 0) && 
            !path.startsWith('/create-workspace')) {
          return NextResponse.redirect(new URL('/create-workspace', request.url))
        }
      }
    }

    return response

  } catch (e) {
    console.error('Middleware error:', e)
    // On error, allow the request to proceed
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}