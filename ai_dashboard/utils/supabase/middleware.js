import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user has a workspace
    if (user) {
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
    if (user && (
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup') ||
      request.nextUrl.pathname.startsWith('/confirm-email')
    )) {
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If no user and trying to access protected pages, redirect to login
    if (!user && 
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/signup') &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith('/confirm-email')
    ) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse

  } catch (e) {
    // If there's an error, return the original request
    return NextResponse.next({
      request,
    })
  }
}