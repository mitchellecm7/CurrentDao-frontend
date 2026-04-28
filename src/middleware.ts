import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware for Performance Optimization and Maintenance Mode
 * 
 * Adds caching headers, performance-related response headers, and maintenance mode functionality.
 * Preserves all existing middleware functionality.
 */
export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === 'true'
  
  if (maintenanceEnabled) {
    // Check if the request is for the maintenance page or API endpoints
    const isMaintenancePage = request.nextUrl.pathname.startsWith('/maintenance')
    const isMaintenanceAPI = request.nextUrl.pathname.startsWith('/api/maintenance')
    
    // Skip maintenance redirect for maintenance page and API
    if (!isMaintenancePage && !isMaintenanceAPI) {
      // Check if IP is whitelisted
      const clientIP = getClientIP(request)
      const whitelistedIPs = process.env.MAINTENANCE_WHITELISTED_IPS?.split(',') || []
      
      if (!whitelistedIPs.includes(clientIP)) {
        // Check if maintenance has ended
        const maintenanceEndTime = process.env.MAINTENANCE_END_TIME
        if (maintenanceEndTime) {
          const endTime = new Date(maintenanceEndTime)
          if (endTime > new Date()) {
            // Maintenance is still active, redirect to maintenance page
            const maintenanceURL = new URL('/maintenance', request.url)
            return NextResponse.redirect(maintenanceURL, { status: 503 })
          }
        } else {
          // No end time set, but maintenance is enabled, redirect to maintenance page
          const maintenanceURL = new URL('/maintenance', request.url)
          return NextResponse.redirect(maintenanceURL, { status: 503 })
        }
      }
    }
  }

  const response = NextResponse.next()

  // Static assets: long cache
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }

  // API routes: no cache by default (they have their own cache logic)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'no-store, must-revalidate'
    )
  }

  // HTML pages: stale-while-revalidate
  if (
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
  }

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback to request IP
  return request.ip || 'unknown'
}

/**
 * Configure middleware matcher
 * Applies to all routes except static files and api routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
