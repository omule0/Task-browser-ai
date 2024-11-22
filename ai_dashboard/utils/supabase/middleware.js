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

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        console.log('No user found, redirecting to login');
        const redirectUrl = new URL('/login', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')  // Select all fields for better debugging
          .eq('id', user.id)
          .single();

        console.log('Profile query result:', {
          userId: user.id,
          profile,
          error: profileError
        });

        if (profileError) {
          console.error('Profile query error:', profileError);
          const redirectUrl = new URL('/', request.url);
          return NextResponse.redirect(redirectUrl);
        }

        if (!profile) {
          console.error('No profile found for user:', user.id);
          const redirectUrl = new URL('/', request.url);
          return NextResponse.redirect(redirectUrl);
        }

        if (!profile.is_admin) {
          console.log('User is not admin:', {
            userId: user.id,
            isAdmin: profile.is_admin
          });
          const redirectUrl = new URL('/', request.url);
          return NextResponse.redirect(redirectUrl);
        }

        console.log('Admin access granted for user:', user.id);
      } catch (error) {
        console.error('Error checking admin status:', error);
        const redirectUrl = new URL('/', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    const { data: { session } } = await supabase.auth.getSession()

    if (session && (
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')
    )) {
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    if (!session && 
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/signup')
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