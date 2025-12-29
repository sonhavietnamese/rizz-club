import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

// Load environment variables from .env file (for local development)
// Next.js automatically loads .env files, but this ensures it works in all contexts
config({ path: '.env.local' })
config({ path: '.env' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please set it in your .env.local file or Vercel environment variables.'
  )
}

const sql = neon(databaseUrl)
export const db = drizzle(sql)
