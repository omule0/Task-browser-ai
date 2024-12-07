import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request) {
  // Check if the request is coming from the old domain
  if (request.headers.get('host') === 'ai-dashboard-zikm5.ondigitalocean.app') {
    // Create the new URL with the new domain
    const newUrl = new URL(request.url)
    newUrl.host = 'ai.digestafrica.com'
    
    // Return a redirect response
    return Response.redirect(newUrl.toString(), 301)
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
