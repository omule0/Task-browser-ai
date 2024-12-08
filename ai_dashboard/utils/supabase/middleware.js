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

    // Get session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()

    // Define public routes that don't require authentication
    const isPublicRoute = request.nextUrl.pathname.startsWith('/login') ||
                         request.nextUrl.pathname.startsWith('/signup') ||
                         request.nextUrl.pathname.startsWith('/auth') ||
                         request.nextUrl.pathname.startsWith('/confirm-email')

    // Check for maintenance mode
    const { data: maintenance } = await supabase
      .from('system_status')
      .select('maintenance_mode')
      .single();

    // Maintenance mode logic
    if (maintenance?.maintenance_mode === true && 
        !request.nextUrl.pathname.startsWith('/maintenance')) {
      if (!user) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
      }
    }

    // Handle authenticated routes
    if (session) {
      // Redirect from auth pages if already logged in
      if (isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Check workspace only for non-admin pages
      if (!request.nextUrl.pathname.startsWith('/admin')) {
        const { data: workspaces } = await supabase
          .from('workspaces')
          .select('id')
          .limit(1);

        if ((!workspaces || workspaces.length === 0) && 
            !request.nextUrl.pathname.startsWith('/create-workspace')) {
          return NextResponse.redirect(new URL('/create-workspace', request.url))
        }
      }

      // Admin route checks
      if (request.nextUrl.pathname.startsWith('/admin')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    } else {
      // If no session and trying to access protected route
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return response

  } catch (e) {
    console.error('Middleware error:', e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}