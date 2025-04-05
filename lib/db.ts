import { Pool } from '@neondatabase/serverless'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)

declare global {
  var prisma: PrismaClient | undefined
}

export const db = globalThis.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db 