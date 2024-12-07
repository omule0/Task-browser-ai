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

    const { data: { user } } = await supabase.auth.getUser()
    
    // Check for maintenance mode
    const { data: maintenance } = await supabase
      .from('system_status')
      .select('maintenance_mode')
      .single();

    // If trying to access maintenance page when maintenance is off
    if (request.nextUrl.pathname.startsWith('/maintenance') && 
        !maintenance?.maintenance_mode) {
      // Allow admins to view the page
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin) {
          const redirectUrl = new URL('/', request.url);
          return NextResponse.redirect(redirectUrl);
        }
      } else {
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // If maintenance mode is active, check if user is admin
    if (maintenance?.maintenance_mode === true && 
        !request.nextUrl.pathname.startsWith('/maintenance')) {
      
      // If no user, redirect to maintenance page
      if (!user) {
        const redirectUrl = new URL('/maintenance', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      // If not admin, redirect to maintenance page
      if (!profile?.is_admin) {
        const redirectUrl = new URL('/maintenance', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    const { data: { session }, error: userError } = await supabase.auth.getSession()

    // Admin check
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        console.log('No user found, redirecting to login');
        const redirectUrl = new URL('/login', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile || !profile.is_admin) {
          console.log('Admin access denied:', { profileError, profile });
          const redirectUrl = new URL('/', request.url);
          return NextResponse.redirect(redirectUrl);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Check if user has a workspace
    if (session) {
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1);

      // If authenticated but no workspace, redirect to create workspace
      if ((!workspaces || workspaces.length === 0) && 
          !request.nextUrl.pathname.startsWith('/create-workspace')) {
        const redirectUrl = new URL('/create-workspace', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If user is signed in and trying to access auth pages, redirect to dashboard
    if (session && (
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup') ||
      request.nextUrl.pathname.startsWith('/confirm-email')
    )) {
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

     // If no session and trying to access protected pages, redirect to login
    if (!session && 
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/signup') &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith('/confirm-email')
    ) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
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