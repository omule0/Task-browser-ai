import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request) {
  // Check if the request is coming from the old domain
  if (request.headers.get('host') === 'ai-dashboard-zikm5.ondigitalocean.app') {
    // Getthe pathname and search params from the original request
    const pathname = request.nextUrl.pathname
    const searchParams = request.nextUrl.searchParams.toString()
    
    // Construct the new URL manually
    const newUrl = `https://ai.digestafrica.com${pathname}${searchParams ? `?${searchParams}` : ''}`
    
    console.log('Redirecting to:', newUrl) // For debugging
    
    // Return a redirect response
    return Response.redirect(newUrl, 301)
  }

  // For all other requests, continue with the session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
