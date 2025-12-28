import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle CORS
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    'http://localhost:5173', // Vite default port
    'http://localhost:3000',
    'http://localhost:5174',
    // Add your production domain here
  ]

  const response = NextResponse.next()

  // Set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
