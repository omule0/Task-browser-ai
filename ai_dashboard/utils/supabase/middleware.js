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

    const { data: { session }, error } = await supabase.auth.getSession()

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
    // If there's an error, return the original request
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}